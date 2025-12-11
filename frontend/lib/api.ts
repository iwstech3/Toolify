
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toolify-api.onrender.com';

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

export async function sendMessage(
    token: string,
    message: string,
    sessionId?: string,
    file?: File | null,
    voice?: Blob | null
) {
    const formData = new FormData();
    if (message) formData.append("message", message);
    if (sessionId) formData.append("session_id", sessionId);
    if (file) formData.append("file", file);
    if (voice) formData.append("voice", voice, "recording.mp3");

    const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function getChats(token: string) {
    const response = await fetch(`${API_URL}/api/chats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json() as Promise<Chat[]>;
}

export async function getChatMessages(token: string, chatId: string) {
    const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json() as Promise<Message[]>;
}
