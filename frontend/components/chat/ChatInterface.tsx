"use client";

import { ChatInput } from "./ChatInput";
import { Wrench } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function ChatInterface() {
    const { user, isLoaded } = useUser();

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
            <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-8 w-full">

                    {/* Logo / Welcome */}
                    <div className="flex flex-col items-center gap-6 animate-fade-in">
                        {/* Box removed as requested */}
                        <h1 className="text-3xl md:text-4xl font-semibold text-center text-balance bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent pb-1">
                            Hey {isLoaded && user?.firstName ? user.firstName : "Human"}, {getGreeting()} how can I assist you?
                        </h1>
                    </div>

                    {/* Input Area */}
                    <div className="w-full animate-slide-down">
                        <ChatInput />
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
