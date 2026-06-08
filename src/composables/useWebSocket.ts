import { ref, computed } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import type { IMessage } from '@/types/message';

const WS_BASE = 'ws://api.photoshade.ir:8001/ws';

// Singleton state
const chatSocket = ref<WebSocket | null>(null);
const statusSocket = ref<WebSocket | null>(null);
const isConnected = ref(false);

type MessageHandler = (msg: IMessage) => void;
type StatusHandler = (data: { userId: number; status: 'online' | 'offline' }) => void;

const messageListeners = new Map<number, Set<MessageHandler>>();
const statusListeners = new Set<StatusHandler>();

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getToken(): string {
    const { get } = useJwtService();
    return get();
}

function connectChat() {
    const token = getToken();
    if (!token) return;

    const url = `${WS_BASE}/chat/?token=${token}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
        isConnected.value = true;
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.message) {
                const msg: IMessage = data.message;
                const handlers = messageListeners.get(msg.conversationId);
                if (handlers) {
                    handlers.forEach((h) => h(msg));
                }
            }
        } catch {
            // ignore malformed messages
        }
    };

    ws.onclose = () => {
        isConnected.value = false;
        chatSocket.value = null;
        // auto-reconnect after 3 seconds
        reconnectTimer = setTimeout(() => {
            if (getToken()) connectChat();
        }, 3000);
    };

    ws.onerror = () => {
        ws.close();
    };

    chatSocket.value = ws;
}

function connectStatus() {
    const token = getToken();
    if (!token) return;

    const url = `${WS_BASE}/status/?token=${token}`;
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'user_status') {
                statusListeners.forEach((h) =>
                    h({ userId: data.userId, status: data.status })
                );
            }
        } catch {
            // ignore
        }
    };

    ws.onclose = () => {
        statusSocket.value = null;
    };

    statusSocket.value = ws;
}

export function useWebSocket() {
    function connect() {
        if (!chatSocket.value || chatSocket.value.readyState === WebSocket.CLOSED) {
            connectChat();
        }
        if (!statusSocket.value || statusSocket.value.readyState === WebSocket.CLOSED) {
            connectStatus();
        }
    }

    function disconnect() {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        chatSocket.value?.close();
        statusSocket.value?.close();
        chatSocket.value = null;
        statusSocket.value = null;
        isConnected.value = false;
    }

    function sendMessage(payload: {
        conversationId: number;
        text: string;
        imageId?: number | null;
        repliedToId?: number | null;
    }) {
        if (!chatSocket.value || chatSocket.value.readyState !== WebSocket.OPEN) return;
        chatSocket.value.send(
            JSON.stringify({
                type: 'send_message',
                conversationId: payload.conversationId,
                text: payload.text,
                imageId: payload.imageId ?? null,
                repliedToId: payload.repliedToId ?? null,
                clientMessageId: crypto.randomUUID(),
            })
        );
    }

    function onMessage(conversationId: number, handler: MessageHandler) {
        if (!messageListeners.has(conversationId)) {
            messageListeners.set(conversationId, new Set());
        }
        messageListeners.get(conversationId)!.add(handler);
    }

    function offMessage(conversationId: number, handler: MessageHandler) {
        messageListeners.get(conversationId)?.delete(handler);
    }

    function onStatus(handler: StatusHandler) {
        statusListeners.add(handler);
    }

    function offStatus(handler: StatusHandler) {
        statusListeners.delete(handler);
    }

    return {
        isConnected: computed(() => isConnected.value),
        connect,
        disconnect,
        sendMessage,
        onMessage,
        offMessage,
        onStatus,
        offStatus,
    };
}
