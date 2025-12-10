"use client";

import { ChatInput } from "./ChatInput";
import { Wrench, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface() {
    const { user, isLoaded } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (content: string) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content
        };

        setMessages(prev => [...prev, userMessage]);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm processing your request regarding: " + content
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
            {/* Header/Model Selector */}
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-center z-10">
                <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-all font-bold text-lg hover:border-orange-500/30">
                    <Wrench className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span>Toolify</span>
                </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto overflow-hidden">
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
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="w-full shrink-0 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent z-10 px-4">
                        <ChatInput onSend={handleSendMessage} />
                    </div>

                </div>
            </div>

            {/* Footer / Disclaimer */}
            <div className="absolute bottom-4 right-4 animate-fade-in delay-200">
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-orange-500 transition-colors">
                    ?
                </button>
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
