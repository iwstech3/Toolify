"use client";

import {
  Plus,
  Wrench,
  MessageSquare,
  Info,
  X,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { Chat } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onClose?: () => void; // For mobile close
  onToggleCollapse?: () => void; // For desktop collapse
  isCollapsed?: boolean; // Desktop collapse state
  onShowAbout: () => void;
  onShowHelp: () => void;
}

export function Sidebar({ chats, currentChatId, onSelectChat, onNewChat, onClose, onToggleCollapse, isCollapsed, onShowAbout, onShowHelp }: SidebarProps) {
  const { user } = useUser();

  return (
    <aside className="w-16 sm:w-20 hover:w-64 border-r border-border bg-card flex flex-col pt-4 sm:pt-6 pb-4 h-screen select-none z-20 transition-all duration-300 group overflow-hidden absolute md:relative hover:shadow-2xl">
      {/* Header with Logo and Close/Toggle buttons */}
      <div className="mb-6 sm:mb-8 w-full px-2 sm:px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center p-2 sm:p-3 rounded-xl transition-all">
            <div className="w-6 h-6 min-w-[1.5rem] flex items-center justify-center text-orange-500">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="ml-3 font-bold text-lg sm:text-xl text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap flex items-center">
              Toolify
            </span>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden opacity-0 group-hover:opacity-100 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex opacity-0 group-hover:opacity-100 p-2 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* New Chat Action */}
      <div className="w-full px-2 sm:px-4 mb-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center group-hover:justify-start p-3 sm:p-3 min-h-[44px] rounded-xl bg-muted hover:bg-muted/80 transition-all group/btn"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem] text-foreground group-hover/btn:scale-110 transition-transform" />
          <span className="ml-3 font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            New Chat
          </span>
        </button>
      </div>

      {/* Separator */}
      <div className="px-2 sm:px-4 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</p>
      </div>

      {/* Chat History */}
      <nav className="flex-1 flex flex-col gap-1.5 sm:gap-2 w-full px-2 sm:px-4 overflow-y-auto scrollbar-hide">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "flex items-center p-2.5 sm:p-3 min-h-[44px] rounded-xl transition-all relative w-full",
              currentChatId === chat.id
                ? "text-primary bg-primary/10 border-l-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem]" />
            <span className="ml-3 font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden text-left truncate">
              {chat.title || "New Chat"}
            </span>
          </button>
        ))}

        {chats.length === 0 && (
          <div className="hidden group-hover:flex px-3 py-2 text-xs sm:text-sm text-muted-foreground italic">
            No history yet
          </div>
        )}
      </nav>

      {/* Help & About Items */}
      <div className="w-full px-2 sm:px-4 mt-2 space-y-1">
        <button
          onClick={onShowHelp}
          className="w-full flex items-center p-2.5 sm:p-3 min-h-[44px] rounded-xl transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem]" />
          <span className="ml-3 font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            Help & Guide
          </span>
        </button>
        <button
          onClick={onShowAbout}
          className="w-full flex items-center p-2.5 sm:p-3 min-h-[44px] rounded-xl transition-all relative text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Info className="w-5 h-5 sm:w-6 sm:h-6 min-w-[1.25rem] sm:min-w-[1.5rem]" />
          <span className="ml-3 font-medium text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            About Toolify
          </span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1.5 sm:gap-2 items-center w-full px-2 sm:px-4 mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-center group-hover:justify-start w-full min-h-[44px]">
          <ThemeToggle />
        </div>

        {/* User Avatar */}
        <div className="w-full flex justify-center group-hover:justify-start p-2 sm:p-3 min-h-[44px]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 min-w-[2rem] flex items-center justify-center overflow-hidden rounded-full ring-2 ring-border">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9" } }}
            />
          </div>
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center overflow-hidden whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium leading-none truncate">
              {user?.fullName || "User"}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
