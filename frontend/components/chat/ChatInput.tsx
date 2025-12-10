"use client";

import { Paperclip, Mic, Globe, Search, Sparkles, Square } from "lucide-react";
import { useRef, useState } from "react";

export function ChatInput() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleRecordClick = () => {
        setIsRecording(!isRecording);
        // Implement actual recording logic here or just toggle UI state as requested for "perform that action" (visual mostly until backend matches)
        if (!isRecording) {
            console.log("Started recording...");
        } else {
             console.log("Stopped recording.");
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 md:px-0">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => console.log("Files selected:", e.target.files)}
                multiple
            />
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative bg-card border border-border rounded-2xl shadow-lg ring-1 ring-white/5 overflow-hidden transition-all focus-within:ring-orange-500/50">
                    <textarea
                        placeholder="Ask anything..."
                        rows={1}
                        className="w-full bg-transparent p-4 min-h-[60px] max-h-[200px] resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />

                    <div className="flex items-center justify-between px-4 pb-4">
                        {/* Left Actions */}
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Search">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="AI Model">
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Web Search">
                                <Globe className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleAttachClick}
                                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" 
                                title="Attach Files"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleRecordClick}
                                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95 shadow-lg ${
                                    isRecording 
                                    ? "bg-red-500 text-white animate-pulse shadow-red-500/25" 
                                    : "bg-gradient-to-tr from-orange-500 to-orange-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                                }`}
                                title={isRecording ? "Stop Create" : "Start Recording"}
                            >
                                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggested Topics */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in delay-100">
                {["Explain more", "How can I use it", "Precautions"].map((topic) => (
                    <button
                        key={topic}
                        className="px-4 py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-orange-500/50 text-xs text-muted-foreground hover:text-foreground transition-all duration-300"
                    >
                        <span>{topic}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
