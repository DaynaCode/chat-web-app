import { ref, computed } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import type { IMessage } from '@/types/message';

const WS_BASE = 'wss://ws.photoshade.ir/ws';

// Singleton state
const chatSocket = ref<WebSocket | null>(null);
const statusSocket = ref<WebSocket | null>(null);
const isConnected = ref(false);

type MessageHandler = (msg: IMessage) => void;
type MessageEditedHandler = (data: { id: number; conversationId: number; text: string; editedAt: string }) => void;
type MessageDeletedHandler = (data: { messageId: number; conversationId: number }) => void;
type StatusHandler = (data: { userId: number; status: 'online' | 'offline' }) => void;
type MentionHandler = (data: { id: number; conversationId: number; sender: string; text: string; createdAt: string }) => void;
type ReadReceiptHandler = (data: { messageIds: number[]; readerId: number }) => void;
type ErrorHandler = (detail: string) => void;

const messageListeners = new Map<number, Set<MessageHandler>>();
const messageEditedListeners = new Set<MessageEditedHandler>();
const messageDeletedListeners = new Set<MessageDeletedHandler>();
const statusListeners = new Set<StatusHandler>();
const mentionListeners = new Set<MentionHandler>();
const readReceiptListeners = new Set<ReadReceiptHandler>();
const errorListeners = new Set<ErrorHandler>();

let chatReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let statusReconnectTimer: ReturnType<typeof setTimeout> | null = null;

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
    // broadcast to all registered conversation listeners
    messageListeners.forEach((handlers, convId) => {
        if (convId === msg.conversation || convId === msg.conversationId) {
            handlers.forEach((h) => h(msg));
        }
    });
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
            } else if (data.type === 'mention' && data.message) {
                const m = data.message;
                mentionListeners.forEach((h) =>
                    h({
                        id: m.id,
                        conversationId: Number(m.conversationId ?? m.conversation_id ?? 0),
                        sender: m.sender ?? '',
                        text: m.text ?? '',
                        createdAt: m.createdAt ?? m.created_at ?? '',
                    })
                );
            } else if (data.type === 'message_edited' && data.message) {
                const m = data.message;
                messageEditedListeners.forEach((h) =>
                    h({
                        id: Number(m.id),
                        conversationId: Number(m.conversation_id ?? m.conversationId ?? 0),
                        text: m.text ?? '',
                        editedAt: m.edited_at ?? m.editedAt ?? '',
                    })
                );
            } else if (data.type === 'message_deleted') {
                messageDeletedListeners.forEach((h) =>
                    h({
                        messageId: Number(data.message_id ?? data.messageId ?? 0),
                        conversationId: Number(data.conversation_id ?? data.conversationId ?? 0),
                    })
                );
            } else if (data.type === 'read_receipt') {
                const messageIds = (data.message_ids ?? data.messageIds ?? []).map(Number);
                const readerId = Number(data.reader_id ?? data.readerId ?? 0);
                readReceiptListeners.forEach((h) => h({ messageIds, readerId }));
            } else if (data.type === 'error') {
                errorListeners.forEach((h) => h(data.detail ?? 'خطای ناشناخته'));
            }
        } catch {
            // ignore
        }
    };

    ws.onclose = (ev) => {
        isConnected.value = false;
        chatSocket.value = null;
        console.warn('[WS:chat] closed', ev.code, ev.reason);
        chatReconnectTimer = setTimeout(() => {
            if (getToken()) connectChat();
        }, 3000);
    };

    ws.onerror = (ev) => {
        console.error('[WS:chat] error', ev);
        ws.close();
    };

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

    ws.onclose = (ev) => {
        statusSocket.value = null;
        console.warn('[WS:status] closed', ev.code, ev.reason);
        statusReconnectTimer = setTimeout(() => {
            if (getToken()) connectStatus();
        }, 3000);
    };

    ws.onerror = (ev) => {
        console.error('[WS:status] error', ev);
        ws.close();
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
        if (chatReconnectTimer) clearTimeout(chatReconnectTimer);
        if (statusReconnectTimer) clearTimeout(statusReconnectTimer);
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

    function editMessage(messageId: number, text: string): boolean {
        if (!chatSocket.value || chatSocket.value.readyState !== WebSocket.OPEN) return false;
        chatSocket.value.send(JSON.stringify({ type: 'edit_message', message_id: messageId, text }));
        return true;
    }

    function deleteMessage(messageId: number): boolean {
        if (!chatSocket.value || chatSocket.value.readyState !== WebSocket.OPEN) return false;
        chatSocket.value.send(JSON.stringify({ type: 'delete_message', message_id: messageId }));
        return true;
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

    function onMention(handler: MentionHandler) {
        mentionListeners.add(handler);
    }

    function offMention(handler: MentionHandler) {
        mentionListeners.delete(handler);
    }

    function onReadReceipt(handler: ReadReceiptHandler) {
        readReceiptListeners.add(handler);
    }

    function offReadReceipt(handler: ReadReceiptHandler) {
        readReceiptListeners.delete(handler);
    }

    function onError(handler: ErrorHandler) {
        errorListeners.add(handler);
    }

    function offError(handler: ErrorHandler) {
        errorListeners.delete(handler);
    }

    function onMessageEdited(handler: MessageEditedHandler) {
        messageEditedListeners.add(handler);
    }

    function offMessageEdited(handler: MessageEditedHandler) {
        messageEditedListeners.delete(handler);
    }

    function onMessageDeleted(handler: MessageDeletedHandler) {
        messageDeletedListeners.add(handler);
    }

    function offMessageDeleted(handler: MessageDeletedHandler) {
        messageDeletedListeners.delete(handler);
    }

    return {
        isConnected: computed(() => isConnected.value),
        connect,
        disconnect,
        sendMessage,
        editMessage,
        deleteMessage,
        onMessage,
        offMessage,
        onMessageEdited,
        offMessageEdited,
        onMessageDeleted,
        offMessageDeleted,
        onStatus,
        offStatus,
        onMention,
        offMention,
        onReadReceipt,
        offReadReceipt,
        onError,
        offError,
    };
}
