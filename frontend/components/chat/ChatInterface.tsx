"use client";

import { ChatInput } from "./ChatInput";
import { Wrench, Menu, Volume2, VolumeX } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  // CRITICAL: useUser provides the current user's profile data
  const { user, isLoaded } = useUser();
  // CRITICAL: useAuth provides the authentication state and methods to get tokens
  const { getToken, userId } = useAuth();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<api.Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = useCallback(async () => {
    try {
      // Get Clerk token - try standard token first
      const authToken = await getToken();

      if (!authToken) {
        console.warn("⚠️ No auth token available");
        return;
      }

      const chatList = await api.getChats(authToken);
      setChats(chatList);
    } catch (error) {
      console.error("Failed to load chats:", error);
      // Don't show error to user for background chat loading
      // Just log it for debugging
    }
  }, [getToken]);

  // Fetch Chats on Mount
  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, [userId, loadChats]);

  const loadChatMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (token) {
        const msgs = await api.getChatMessages(token, chatId);
        setMessages(
          msgs.map((m) => ({
            id: m.id || Date.now().toString(),
            role: m.role,
            content: m.content,
          }))
        );
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    content: string,
    files?: File[],
    voice?: Blob
  ) => {
    // Determine the actual message that will be sent
    const messageToSend = content || (files && files.length > 0 ? "What is this tool?" : (voice ? "🎤 Audio Message" : ""));

    // Optimistic UI update
    const tempId = Date.now().toString();
    const userMessage: Message = {
      id: tempId,
      role: "user",
      content: messageToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated. Please sign in.");
      }

      console.log("🔐 Using auth token for API request");

      // If no message but has files, provide a default message
      const messageToSend = content || (files && files.length > 0 ? "What is this tool?" : "");

      const response = await api.sendMessage(
        token,
        messageToSend,
        currentChatId || undefined,
        files ? files[0] : null,
        voice
      );

      // Response structure: { content: "...", session_id: "...", ... }
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If it was a new chat, update session and list
      if (response.session_id && response.session_id !== currentChatId) {
        setCurrentChatId(response.session_id);
        loadChats(); // Refresh list to show new chat title
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Determine error message
      let errorMessage =
        "Sorry, I encountered an error processing your request. Please try again.";

      if (error instanceof api.APIError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show error in UI
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingMessageId(null);
    }
  };

  const handlePlayAudio = async (messageId: string, content: string) => {
    try {
      // If already playing this message, stop it
      if (playingMessageId === messageId && audioRef.current) {
        audioRef.current.pause();
        setPlayingMessageId(null);
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Get auth token
      const token = await getToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      // Set loading state
      setPlayingMessageId(messageId);

      // Call backend TTS endpoint
      const formData = new FormData();
      formData.append('text', content);
      formData.append('language', 'en');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://toolify-api.onrender.com'}/api/generate-tts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      // Get audio blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setPlayingMessageId(null);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setPlayingMessageId(null);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingMessageId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar (visible on desktop, hidden on mobile unless toggled) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:relative md:translate-x-0 h-full",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
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
        <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between md:justify-center z-10 pointer-events-none">
          <button
            className="md:hidden pointer-events-auto p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-card border border-border"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Centered Brand (only if no sidebar) - but sidebar has brand. 
                        Let's keep the "Toolify" chip for context if needed, but redundant with sidebar. 
                        Maybe keep it for consistent "Chat Mode" feel. 
                    */}
          <div className="pointer-events-auto">
            <button className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-all font-bold text-base sm:text-lg hover:border-orange-500/30">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500" />
              <span className="hidden xs:inline">Toolify</span>
            </button>
          </div>
          <div className="w-11 md:hidden" /> {/* Spacer */}
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 w-full max-w-5xl mx-auto overflow-hidden mt-14 sm:mt-16 md:mt-0">
          <div className="flex flex-col w-full h-full relative">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 md:gap-8 animate-fade-in">
                  {/* Logo / Welcome - Only shown when no messages */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 px-3 sm:px-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-balance bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent pb-1">
                      Hey{" "}
                      {isLoaded && user?.firstName ? user.firstName : "Human"},{" "}
                      {getGreeting()} how can I assist you?
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 w-full max-w-3xl mx-auto pb-3 sm:pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex w-full ${message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`flex gap-3 sm:gap-4 max-w-[95%] sm:max-w-[85%] ${message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                          }`}
                      >
                        {/* Content Box */}
                        <div className="flex flex-col gap-2">
                          <div
                            className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${message.role === "user"
                              ? "bg-card border border-orange-500 text-foreground shadow-sm"
                              : "bg-transparent text-foreground/90"
                              }`}
                          >
                            {message.content}
                          </div>

                          {/* Audio button for AI messages */}
                          {message.role === "assistant" && (
                            <button
                              onClick={() => handlePlayAudio(message.id!, message.content)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all self-start ${playingMessageId === message.id
                                ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              title={playingMessageId === message.id ? "Stop audio" : "Play audio"}
                            >
                              {playingMessageId === message.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span>Listen</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex w-full justify-start">
                      <div className="flex items-center gap-2 text-muted-foreground p-3 sm:p-4">
                        <span className="animate-pulse text-sm sm:text-base">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="w-full shrink-0 pb-3 sm:pb-4 md:pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent z-10 px-2 sm:px-3 md:px-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Footer / Disclaimer */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 animate-fade-in delay-200 hidden md:block">
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 hover:text-orange-500 transition-colors" aria-label="Help">
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
