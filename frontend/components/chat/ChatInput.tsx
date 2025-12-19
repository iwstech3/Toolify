"use client";

import { Paperclip, Mic, Globe, Search, Sparkles, Square, X, File as FileIcon, Send } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface ChatInputProps {
    onSend?: (message: string, files?: File[], audioBlob?: Blob) => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // File state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Audio state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        const message = textareaRef.current?.value.trim() || "";

        // Don't send if empty and no attachments/voice
        if (!message && selectedFiles.length === 0 && audioChunks.length === 0 && !isRecording) return;

        // If recording, stop it first
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        if (onSend) {
            // If we have audio chunks, create blob
            let audioBlob: Blob | undefined = undefined;
            if (audioChunks.length > 0) {
                audioBlob = new Blob(audioChunks, { type: 'audio/mp3' }); // fallback type
            }

            // Send with message (can be empty if files/audio present)
            onSend(message, selectedFiles, audioBlob);

            // Clear state
            if (textareaRef.current) textareaRef.current.value = "";
            setSelectedFiles([]);
            setAudioChunks([]);
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRecordClick = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                const chunks: Blob[] = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    setAudioChunks(chunks);
                    // Automatically send/notify? For now just store.
                    stream.getTracks().forEach(track => track.stop());

                    // Optional: Auto-send after stop? User request says "entering prompt... as voice". 
                    // Usually you stop then send.
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone.");
            }
        }
    };

    const handleSendVoice = () => {
        if (audioChunks.length > 0) {
            handleSend();
        }
    };

    // While recording, audio chunks aren't ready until stop. 
    // If user clicks Send while recording, we should probably stop and send.
    // For now, let's just make the user stop recording first.

    return (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-0">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
                accept="image/*" // Restrict to images for now as backend seems focused on tool recognition
            />

            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 bg-muted px-2 sm:px-3 py-1 rounded-full text-xs animate-in fade-in slide-in-from-bottom-2">
                            <FileIcon className="w-3 h-3" />
                            <span className="max-w-[80px] sm:max-w-[100px] truncate">{file.name}</span>
                            <button onClick={() => removeFile(i)} className="hover:text-red-500 min-h-[24px] min-w-[24px] flex items-center justify-center">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {/* Audio Preview (Simple) */}
            {!isRecording && audioChunks.length > 0 && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-lg text-xs sm:text-sm text-orange-500">
                    <Mic className="w-4 h-4" />
                    <span>Voice recording ready</span>
                    <button onClick={() => setAudioChunks([])} className="hover:text-red-500 ml-auto min-h-[32px] min-w-[32px] flex items-center justify-center">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-white/5 overflow-hidden transition-all focus-within:ring-orange-500/50">
                    <textarea
                        ref={textareaRef}
                        placeholder={isRecording ? "Listening..." : "Ask anything..."}
                        rows={1}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isRecording}
                        className="w-full bg-transparent p-3 sm:p-4 min-h-[56px] sm:min-h-[60px] max-h-[180px] sm:max-h-[200px] resize-none focus:outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                    />

                    <div className="flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4">
                        {/* Left Actions */}
                        <div className="flex gap-1 sm:gap-2">
                            <button className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Search">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="AI Model">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Web Search">
                                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={handleAttachClick}
                                className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                title="Attach Files"
                            >
                                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {/* Voice/Send Button - Changes based on state */}
                            {audioChunks.length > 0 && !isRecording ? (
                                // Send button when audio is ready
                                <button
                                    onClick={handleSendVoice}
                                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all active:scale-95 shadow-lg bg-gradient-to-tr from-green-500 to-green-600 text-white shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
                                    title="Send Voice Message"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            ) : (
                                // Record button
                                <button
                                    onClick={handleRecordClick}
                                    className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all active:scale-95 shadow-lg ${isRecording
                                        ? "bg-red-500 text-white animate-pulse shadow-red-500/25"
                                        : "bg-gradient-to-tr from-orange-500 to-orange-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
                                        }`}
                                    title={isRecording ? "Stop Recording" : "Start Recording"}
                                >
                                    {isRecording ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggested Topics - Only show if empty chat? Passed from parent? For now keep static */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 animate-fade-in delay-100">
                {["Explain more", "How can I use it", "Precautions"].map((topic) => (
                    <button
                        key={topic}
                        onClick={() => onSend?.(topic)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-orange-500/50 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all duration-300"
                    >
                        <span>{topic}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
