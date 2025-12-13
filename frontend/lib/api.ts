
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toolify-api.onrender.com';

// Log API URL for debugging
console.log('🔗 Toolify API URL:', API_URL);

export interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    created_at?: string;
}

export interface Chat {
    id: string;
    title: string;
    created_at: string;
}

export interface ChatResponse {
    content: string;
    timestamp: string;
    language: string;
    session_id: string;
}

/**
 * Custom error class for API errors with status code
 */
export class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Send a message to the chat API with optional file and voice attachments
 */
export async function sendMessage(
    token: string,
    message: string,
    sessionId?: string,
    file?: File | null,
    voice?: Blob | null
): Promise<ChatResponse> {
    try {
        const formData = new FormData();
        if (message) formData.append("message", message);
        if (sessionId) formData.append("session_id", sessionId);
        if (file) formData.append("file", file);
        if (voice) formData.append("voice", voice, "recording.mp3");

        console.log('📤 Sending message to API:', {
            hasMessage: !!message,
            hasSessionId: !!sessionId,
            hasFile: !!file,
            hasVoice: !!voice
        });

        const response = await fetch(`${API_URL}/api/chat`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);

            if (response.status === 401) {
                throw new APIError(401, 'Authentication failed. Please sign in again.');
            } else if (response.status === 400) {
                throw new APIError(400, 'Invalid request. Please check your input.');
            } else if (response.status === 500) {
                throw new APIError(500, 'Server error. Please try again later.');
            }

            throw new APIError(response.status, `API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Message sent successfully:', data);
        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        console.error('❌ Network error:', error);
        throw new Error('Network error. Please check your connection.');
    }
}

/**
 * Fetch all chats for the current user
 */
export async function getChats(token: string): Promise<Chat[]> {
    try {
        console.log('📥 Fetching chats...');

        const response = await fetch(`${API_URL}/api/chats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to fetch chats:', response.status, errorText);

            if (response.status === 401) {
                throw new APIError(401, 'Authentication failed. Please sign in again.');
            }

            throw new APIError(response.status, `Failed to fetch chats: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Fetched chats:', data.length, 'chats');
        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        console.error('❌ Network error fetching chats:', error);
        throw new Error('Failed to load chat history. Please try again.');
    }
}

/**
 * Fetch messages for a specific chat
 */
export async function getChatMessages(token: string, chatId: string): Promise<Message[]> {
    try {
        console.log('📥 Fetching messages for chat:', chatId);

        const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to fetch messages:', response.status, errorText);

            if (response.status === 401) {
                throw new APIError(401, 'Authentication failed. Please sign in again.');
            } else if (response.status === 404) {
                throw new APIError(404, 'Chat not found.');
            } else if (response.status === 403) {
                throw new APIError(403, 'You do not have access to this chat.');
            }

            throw new APIError(response.status, `Failed to fetch messages: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Fetched messages:', data.length, 'messages');
        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        console.error('❌ Network error fetching messages:', error);
        throw new Error('Failed to load messages. Please try again.');
    }
}
