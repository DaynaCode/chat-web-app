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

// Normalize WS message: handle both camelCase and snake_case from server
function normalizeMessage(raw: Record<string, any>): IMessage {
    // server may use: conversationId, conversation_id, or conversation (FK int)
    const conversation = Number(
        raw.conversationId ?? raw.conversation_id ?? raw.conversation ?? 0
    );
    const sender = raw.sender ?? {};
    return {
        id: raw.id,
        conversation,
        conversationId: conversation,
        sender: {
            id: Number(sender.id ?? 0),
            username: sender.username ?? '',
            displayName: sender.displayName ?? sender.display_name ?? sender.username ?? '',
        },
        text: raw.text ?? null,
        image: raw.image ?? null,
        createdAt: raw.createdAt ?? raw.created_at ?? '',
        editedAt: raw.editedAt ?? raw.edited_at ?? null,
        isDeleted: raw.isDeleted ?? raw.is_deleted ?? false,
        repliedTo: null,
        clientMessageId: raw.clientMessageId ?? raw.client_message_id,
    };
}

function dispatchMessage(raw: Record<string, any>) {
    const msg = normalizeMessage(raw);
    const handlers = messageListeners.get(msg.conversation);
    if (handlers) {
        handlers.forEach((h) => h(msg));
    }
}

function connectChat() {
    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/chat/?token=${token}`);

    ws.onopen = () => {
        isConnected.value = true;
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.message) {
                dispatchMessage(data.message);
            }
        } catch {
            // ignore
        }
    };

    ws.onclose = () => {
        isConnected.value = false;
        chatSocket.value = null;
        reconnectTimer = setTimeout(() => {
            if (getToken()) connectChat();
        }, 3000);
    };

    ws.onerror = () => ws.close();

    chatSocket.value = ws;
}

function connectStatus() {
    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/status/?token=${token}`);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'user_status') {
                const userId = Number(data.userId ?? data.user_id ?? 0);
                const status = data.status;
                statusListeners.forEach((h) => h({ userId, status }));
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

    // Returns clientMessageId so caller can use for optimistic update
    function sendMessage(payload: {
        conversationId: number;
        text: string;
        imageId?: number | null;
        repliedToId?: number | null;
    }): string | null {
        if (!chatSocket.value || chatSocket.value.readyState !== WebSocket.OPEN) return null;
        const clientMessageId = crypto.randomUUID();
        chatSocket.value.send(
            JSON.stringify({
                type: 'send_message',
                // send both forms to be safe
                conversationId: payload.conversationId,
                conversation_id: payload.conversationId,
                text: payload.text,
                imageId: payload.imageId ?? null,
                image_id: payload.imageId ?? null,
                repliedToId: payload.repliedToId ?? null,
                replied_to_id: payload.repliedToId ?? null,
                clientMessageId,
                client_message_id: clientMessageId,
            })
        );
        return clientMessageId;
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
