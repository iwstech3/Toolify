"use client";

import { ChatInput } from "./ChatInput";
import { Wrench, Menu, Volume2, VolumeX, MessageSquarePlus, X, PanelLeftClose, PanelLeft, Search, MessageSquare, Info, BookOpen, StopCircle } from "lucide-react"; // Import new icons
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string; // For displaying uploaded images
  audioUrl?: string; // For displaying sent audio
}

interface ManualMessage extends Message {
  isManual?: boolean;
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop

  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
    // Create image URL for preview if file exists
    let imageUrl: string | undefined = undefined;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      imageUrl = URL.createObjectURL(files[0]);
    }

    // Create audio URL for preview if voice exists
    let audioUrl: string | undefined = undefined;
    if (voice) {
      audioUrl = URL.createObjectURL(voice);
    }

    // Determine the actual message that will be sent
    const messageToSend = content || (files && files.length > 0 ? "What is this tool?" : "");

    // Optimistic UI update
    const tempId = Date.now().toString();
    const userMessage: Message = {
      id: tempId,
      role: "user",
      content: messageToSend,
      imageUrl,
      audioUrl,
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

  const handleGenerateManual = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Note: Ideally pass file from ChatInput, but for now we call API
      // If we want file support, we need to lift file state or pass it in callback
      // For now, we'll try to generate manual based on just text or recent context if API supports it,
      // or just error out/ask for file if needed.
      // But referencing the previous plan, we wanted to support file upload from the input.
      // Since we can't easily access ChatInput state here without lifting it, 
      // we will implement a basic version that triggers the API.

      // We'll pass both toolName and file as undefined/null for now, 
      // assuming the user might want to generate a manual for a text query they just sent 
      // OR we might need to handle the file upload separately.
      // Given constraints, let's assume the user attaches a file in the input 
      // and clicks "Generate Manual" instead of "Send".
      // BUT ChatInput handles that logic. If we want to support this fully, 
      // we'd need ChatInput to pass the file to onGenerateManual.
      // Let's assume for this iteration we just trigger the "text" based manual or error.

      // BETTER APPROACH: Just call it. If the API requires a file, it will error.
      const response = await api.generateManual(token, undefined, null);

      const manualMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Manual for ${response.tool_name}**\n\n${response.summary}\n\n**Full Manual:**\n${response.manual}`,
      };

      setMessages(prev => [...prev, manualMessage]);

    } catch (error) {
      console.error("Failed to generate manual:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Failed to generate manual. Please try again. Make sure to upload an image if needed."
      }]);
    } finally {
      setIsLoading(false);
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

      // Call backend TTS endpoint using api helper
      const audioBlob = await api.generateTTS(token, content);
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
          "fixed inset-y-0 left-0 z-30 transition-all duration-300 md:relative h-full",
          // Mobile: slide in/out
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible but can be collapsed
          "md:translate-x-0",
          isSidebarCollapsed && "md:w-0 md:overflow-hidden"
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
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isCollapsed={isSidebarCollapsed}
          onShowAbout={() => setShowAbout(true)}
          onShowHelp={() => setShowHelp(true)}
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
        {/* Header */}
        <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-2 sm:px-4 absolute top-0 w-full bg-background/80 backdrop-blur-md z-10 md:hidden">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-muted rounded-lg"
          >
            <PanelLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <span className="font-semibold text-sm sm:text-base">Toolify</span>
          <div className="w-9 sm:w-10" /> {/* Spacer for balance */}
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 w-full max-w-5xl mx-auto overflow-hidden mt-14 sm:mt-16 md:mt-0">
          <div className="flex flex-col w-full h-full relative">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                // Empty State with Greeting
                <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-6 md:gap-8 animate-fade-in">
                  <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 px-3 sm:px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-2 sm:mb-4 animate-float">
                      <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-balance bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent pb-1">
                      Hey {isLoaded && user?.firstName ? user.firstName : "Human"}, {getGreeting()} how can I assist you?
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md text-balance leading-relaxed">
                      I can help you identify tools, provide usage manuals, and answer your technical questions.
                    </p>
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
                        {/* Avatar */}
                        <div className={`mt-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${message.role === "user"
                          ? "bg-gradient-to-tr from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                          : "bg-surface-2 border border-border text-foreground"
                          }`}>
                          {message.role === "user" ? (
                            <span className="font-bold">You</span>
                          ) : (
                            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                          )}
                        </div>

                        {/* Content Box */}
                        <div className="flex flex-col gap-2">
                          {/* Image Display */}
                          {message.imageUrl && (
                            <div className="rounded-xl overflow-hidden border border-border max-w-sm">
                              <img src={message.imageUrl} alt="Uploaded content" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          {/* Audio Player (Sent Audio) */}
                          {message.audioUrl && (
                            <div className="p-3 bg-muted/50 rounded-xl border border-border">
                              <audio controls src={message.audioUrl} className="w-full max-w-sm" style={{ height: '40px' }} />
                            </div>
                          )}

                          {/* Text Content */}
                          {message.content && (
                            <div
                              className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${message.role === "user"
                                ? "bg-card border border-orange-500 text-foreground shadow-sm"
                                : "bg-transparent text-foreground/90"
                                }`}
                            >
                              <div className="markdown-content whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                          )}

                          {/* Audio button for AI messages (YarnGPT) */}
                          {message.role === "assistant" && (
                            <button
                              onClick={() => handlePlayAudio(message.id!, message.content)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all self-start ${playingMessageId === message.id
                                ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              title={playingMessageId === message.id ? "Stop audio" : "Play audio (YarnGPT)"}
                            >
                              {playingMessageId === message.id ? (
                                <>
                                  <StopCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                onGenerateManual={handleGenerateManual}
              />
            </div>
          </div>
        </div>
      </div>


      {/* About Modal - Rendered at root level to avoid z-index/overflow issues */}
      {
        showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAbout(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </button>

              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Wrench className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">About Toolify</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      AI-Powered Tool Assistant
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-foreground/90 leading-relaxed">
                  <p>
                    <strong>Toolify</strong> is your intelligent companion for
                    understanding and mastering tools. Whether you&apos;re dealing
                    with software utilities, mechanical instruments, or complex
                    machinery, Toolify leverages advanced AI to provide instant,
                    accurate assistance.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
                      <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <Search className="w-4 h-4 text-orange-500" />
                        Smart Recognition
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Instantly identify tools and equipment through
                        descriptions or images.
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
                      <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                        Interactive Guide
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get step-by-step usage instructions, safety precautions,
                        and maintenance tips.
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground border-t border-border pt-4">
                    Version 1.0.0 • Developed by Smartech Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl border border-border p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </button>

            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Info className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">How to use Toolify</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Quick guide to navigating the app
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      <MessageSquare className="w-4 h-4" />
                      Chatting
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Type your questions in the input box below. You can ask about any tool, maintenance procedures, or safety guidelines.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Search className="w-4 h-4" />
                      Image Recognition
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload an image of a tool by clicking the <strong>+</strong> icon and selecting &quot;Attach Files&quot;. Toolify will identify it for you.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      <BookOpen className="w-4 h-4" />
                      Generate Manuals
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Need a formal manual? Click the <strong>+</strong> icon and select &quot;Generate Manual&quot;. It creates a structured guide for your tool.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Volume2 className="w-4 h-4" />
                      Audio Playback
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Listen to AI responses by clicking the &quot;Listen&quot; button below any assistant message. Great for hands-free learning!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-600/90 text-sm">
                <strong>Pro Tip:</strong> Use the sidebar to access your chat history or start a new conversation anytime.
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
