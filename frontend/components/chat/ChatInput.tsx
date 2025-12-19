"use client";

import { Paperclip, Mic, Globe, Square, X, Send, Plus, BookOpen } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface ChatInputProps {
    onSend?: (message: string, files?: File[], audioBlob?: Blob) => void;
    onGenerateManual?: () => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, onGenerateManual, isLoading }: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // ... (rest of state)

    // ... (rest of functions)

    return (
        // ... (wrapper)
        {/* Attach Menu Dropdown */ }
                            {
        showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[180px] z-20 animate-in fade-in slide-in-from-bottom-2">
                <button
                    onClick={handleAttachClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                    <Paperclip className="w-4 h-4" />
                    <span>Attach Files</span>
                </button>
                <button
                    onClick={() => setShowAttachMenu(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                    <Globe className="w-4 h-4" />
                    <span>Web Search</span>
                </button>
                <button
                    onClick={() => {
                        setShowAttachMenu(false);
                        onGenerateManual?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Generate Manual</span>
                </button>
            </div>
        )
    }

    // File state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Audio state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update recording timer
    useEffect(() => {
        if (isRecording) {
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            setRecordingTime(0);
        }
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const handleSend = () => {
        const message = inputValue.trim();

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
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            }

            // Send with message (can be empty if files/audio present)
            onSend(message, selectedFiles, audioBlob);

            // Clear state
            setInputValue("");
            if (textareaRef.current) textareaRef.current.value = "";
            setSelectedFiles([]);
            setImagePreviews([]);
            setAudioChunks([]);
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
        setShowAttachMenu(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);

            // Create image previews
            newFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreviews(prev => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
                    stream.getTracks().forEach(track => track.stop());
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

    // Determine which button to show
    const showSendButton = inputValue.trim().length > 0 || audioChunks.length > 0;

    return (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-0">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
                accept="image/*"
            />

            {/* Image Previews - Below text field */}
            {imagePreviews.length > 0 && (
                <div className="mb-3 p-3 bg-card border border-border rounded-xl">
                    <div className="flex flex-wrap gap-2">
                        {imagePreviews.map((preview, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${i + 1}`}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-border"
                                />
                                <button
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Audio Preview (Simple) */}
            {!isRecording && audioChunks.length > 0 && (
                <div className="flex items-center gap-2 mb-2 p-3 bg-muted/50 rounded-lg text-xs sm:text-sm text-orange-500">
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
                    {/* Recording Indicator Overlay */}
                    {isRecording && (
                        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none">
                            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full animate-pulse">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span className="font-medium">Recording {formatTime(recordingTime)}</span>
                            </div>
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={isRecording ? "Recording..." : "Ask anything..."}
                        rows={1}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || isRecording}
                        className="w-full bg-transparent p-3 sm:p-4 min-h-[56px] sm:min-h-[60px] max-h-[180px] sm:max-h-[200px] resize-none focus:outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                    />

                    <div className="flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4">
                        {/* Left Actions - Plus Menu */}
                        <div className="relative flex gap-1 sm:gap-2">
                            <button
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className="p-2 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                title="More options"
                                disabled={isRecording}
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {/* Attach Menu Dropdown */}
                            {showAttachMenu && (
                                <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[160px] z-20 animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        onClick={handleAttachClick}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        <span>Attach Files</span>
                                    </button>
                                    <button
                                        onClick={() => setShowAttachMenu(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>Web Search</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Dynamic Send/Record Button */}
                            {showSendButton ? (
                                // Send button when user has typed or has audio ready
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all active:scale-95 shadow-lg bg-gradient-to-tr from-green-500 to-green-600 text-white shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 disabled:opacity-50"
                                    title="Send Message"
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
                        disabled={isRecording}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-orange-500/50 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all duration-300 disabled:opacity-50"
                    >
                        <span>{topic}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
