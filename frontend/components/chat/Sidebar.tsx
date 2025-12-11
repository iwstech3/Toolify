"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Wrench,
  Settings,
  MessageSquare,
  Info,
  type LucideIcon,
  X,
  MessageCircle,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Chat } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ chats, currentChatId, onSelectChat, onNewChat }: SidebarProps) {
  const [showAbout, setShowAbout] = useState(false);
  const { user } = useUser();

  return (
    <>
      <aside className="w-20 hover:w-64 border-r border-border bg-card flex flex-col pt-6 pb-4 h-screen select-none z-20 transition-all duration-300 group overflow-hidden absolute md:relative hover:shadow-2xl">
        {/* Logo Area */}
        <div className="mb-8 w-full px-4">
          <div className="flex items-center p-3 rounded-xl transition-all">
            <div className="w-6 h-6 min-w-[1.5rem] flex items-center justify-center text-orange-500">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="ml-3 font-bold text-xl text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap flex items-center">
              Toolify
            </span>
          </div>
        </div>

        {/* New Chat Action */}
        <div className="w-full px-4 mb-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center group-hover:justify-start p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all group/btn"
          >
            <Plus className="w-6 h-6 min-w-[1.5rem] text-foreground group-hover/btn:scale-110 transition-transform" />
            <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              New Chat
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="px-4 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</p>
        </div>

        {/* Chat History */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-4 overflow-y-auto scrollbar-hide">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "flex items-center p-3 rounded-xl transition-all relative w-full",
                currentChatId === chat.id
                  ? "text-primary bg-primary/10 border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <MessageSquare className="w-6 h-6 min-w-[1.5rem]" />
              <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden text-left truncate">
                {chat.title || "New Chat"}
              </span>
            </button>
          ))}

          {chats.length === 0 && (
            <div className="hidden group-hover:flex px-3 py-2 text-sm text-muted-foreground italic">
              No history yet
            </div>
          )}
        </nav>

        {/* About Item */}
        <div className="w-full px-4 mt-2">
          <button
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center p-3 rounded-xl transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Info className="w-6 h-6 min-w-[1.5rem]" />
            <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              About Toolify
            </span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 items-center w-full px-4 mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-center group-hover:justify-start w-full">
            <ThemeToggle />
          </div>
          <button className="flex items-center justify-center group-hover:justify-start w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Settings className="w-6 h-6 min-w-[1.5rem]" />
            <span className="ml-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              Settings
            </span>
          </button>

          {/* User Avatar */}
          <div className="w-full flex justify-center group-hover:justify-start p-3">
            <div className="w-8 h-8 min-w-[2rem] flex items-center justify-center overflow-hidden rounded-full ring-2 ring-border">
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "w-8 h-8" } }}
              />
            </div>
            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center overflow-hidden whitespace-nowrap">
              <span className="text-sm font-medium leading-none truncate">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Wrench className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">About Toolify</h2>
                  <p className="text-muted-foreground">
                    AI-Powered Tool Assistant
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>
                  <strong>Toolify</strong> is your intelligent companion for
                  understanding and mastering tools. Whether you&apos;re dealing
                  with software utilities, mechanical instruments, or complex
                  machinery, Toolify leverages advanced AI to provide instant,
                  accurate assistance.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-orange-500" />
                      Smart Recognition
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Instantly identify tools and equipment through
                      descriptions or images.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      Interactive Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
      )}
    </>
  );
}
