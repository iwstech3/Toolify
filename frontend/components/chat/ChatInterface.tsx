"use client";

import { ChatInput } from "./ChatInput";
import { Wrench, Menu } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface() {
    const { user, isLoaded } = useUser();
    const { getToken, userId } = useAuth();

    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<api.Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Chats on Mount
    useEffect(() => {
        if (userId) {
            loadChats();
        }
    }, [userId]);

    const loadChats = async () => {
        try {
            // Get Clerk token - try standard token first
            const authToken = await getToken();

            if (!authToken) {
                console.warn('⚠️ No auth token available');
                return;
            }

            const chatList = await api.getChats(authToken);
            setChats(chatList);
        } catch (error) {
            console.error("Failed to load chats:", error);
            // Don't show error to user for background chat loading
            // Just log it for debugging
        }
    };

    const loadChatMessages = async (chatId: string) => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (token) {
                const msgs = await api.getChatMessages(token, chatId);
                setMessages(msgs.map(m => ({
                    id: m.id || Date.now().toString(),
                    role: m.role,
                    content: m.content
                })));
                setCurrentChatId(chatId);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (content: string, files?: File[], voice?: Blob) => {
        // Optimistic UI update
        const tempId = Date.now().toString();
        const userMessage: Message = {
            id: tempId,
            role: "user",
            content: content || (voice ? "🎤 Audio Message" : "📁 Attachment")
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Not authenticated. Please sign in.");
            }

            console.log('🔐 Using auth token for API request');

            const response = await api.sendMessage(
                token,
                content,
                currentChatId || undefined,
                files ? files[0] : null,
                voice
            );

            // Response structure: { content: "...", session_id: "...", ... }
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.content
            };

            setMessages(prev => [...prev, aiMessage]);

            // If it was a new chat, update session and list
            if (response.session_id && response.session_id !== currentChatId) {
                setCurrentChatId(response.session_id);
                loadChats(); // Refresh list to show new chat title
            }

        } catch (error) {
            console.error("Failed to send message:", error);

            // Determine error message
            let errorMessage = "Sorry, I encountered an error processing your request. Please try again.";

            if (error instanceof api.APIError) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Show error in UI
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: `⚠️ ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar (visible on desktop, hidden on mobile unless toggled) */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:relative md:translate-x-0 h-full",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <Sidebar
                    chats={chats}
                    currentChatId={currentChatId}
                    onSelectChat={(id) => {
                        loadChatMessages(id);
                        setIsSidebarOpen(false);
                    }}
                    onNewChat={() => {
                        handleNewChat();
                        setIsSidebarOpen(false);
                    }}
                />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
                {/* Mobile Header */}
                <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between md:justify-center z-10 pointer-events-none">
                    <button
                        className="md:hidden pointer-events-auto p-2 rounded-lg bg-card border border-border"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Centered Brand (only if no sidebar) - but sidebar has brand. 
                        Let's keep the "Toolify" chip for context if needed, but redundant with sidebar. 
                        Maybe keep it for consistent "Chat Mode" feel. 
                    */}
                    <div className="pointer-events-auto">
                        <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-all font-bold text-lg hover:border-orange-500/30">
                            <Wrench className="w-5 h-5 text-orange-500 fill-orange-500" />
                            <span>Toolify</span>
                        </button>
                    </div>

                    <div className="w-9 md:hidden" /> {/* Spacer */}
                </header>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto overflow-hidden mt-16 md:mt-0">
                    <div className="flex flex-col w-full h-full relative">

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto w-full px-4 py-4 space-y-6 scrollbar-hide">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-8 animate-fade-in">
                                    {/* Logo / Welcome - Only shown when no messages */}
                                    <div className="flex flex-col items-center gap-6">
                                        <h1 className="text-3xl md:text-4xl font-semibold text-center text-balance bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent pb-1">
                                            Hey {isLoaded && user?.firstName ? user.firstName : "Human"}, {getGreeting()} how can I assist you?
                                        </h1>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-4 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Content Box */}
                                                <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${message.role === 'user'
                                                    ? 'bg-card border border-orange-500 text-foreground shadow-sm'
                                                    : 'bg-transparent text-foreground/90'
                                                    }`}>
                                                    {message.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex w-full justify-start">
                                            <div className="flex items-center gap-2 text-muted-foreground p-4">
                                                <span className="animate-pulse">Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="w-full shrink-0 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent z-10 px-4">
                            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                        </div>

                    </div>
                </div>

                {/* Footer / Disclaimer */}
                <div className="absolute bottom-4 right-4 animate-fade-in delay-200 hidden md:block">
                    <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-orange-500 transition-colors">
                        ?
                    </button>
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}
