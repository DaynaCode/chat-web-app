import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toRef, isRef, type Ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IConversation } from '@/types/conversation';
import type { IMessage, IMessagesPage, ISendMessage } from '@/types/message';

const API_BASE = 'https://api.photoshade.ir';

function toAbsoluteUrl(path: any): string | null {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function extractImageUrls(raw: any): { thumbnail: string | null; original: string | null } {
    if (!raw) return { thumbnail: null, original: null };
    if (typeof raw === 'object') {
        return {
            thumbnail: toAbsoluteUrl(raw.url ?? null),
            original: toAbsoluteUrl(raw.originalUrl ?? raw.original_url ?? raw.url ?? null),
        };
    }
    if (typeof raw === 'string') {
        const abs = toAbsoluteUrl(raw);
        return { thumbnail: abs, original: abs };
    }
    return { thumbnail: null, original: null };
}

function normalizeSender(s: any) {
    if (!s) return { id: 0, username: '', displayName: '' };
    return {
        id: Number(s.id ?? 0),
        username: s.username ?? '',
        displayName: s.displayName ?? s.display_name ?? s.username ?? '',
    };
}

function normalizeMsg(msg: any): IMessage {
    const { thumbnail, original } = extractImageUrls(msg.image ?? msg.image_url ?? null);
    const rawRepliedTo = msg.repliedTo ?? msg.replied_to ?? null;
    let repliedTo: IMessage | null = null;
    if (rawRepliedTo) {
        const { thumbnail: rt, original: ro } = extractImageUrls(rawRepliedTo.image ?? rawRepliedTo.image_url ?? null);
        repliedTo = {
            ...rawRepliedTo,
            sender: normalizeSender(rawRepliedTo.sender),
            image: rt,
            imageOriginalUrl: ro,
            repliedTo: null,
            createdAt: rawRepliedTo.createdAt ?? rawRepliedTo.created_at ?? '',
            editedAt: rawRepliedTo.editedAt ?? rawRepliedTo.edited_at ?? null,
            isDeleted: rawRepliedTo.isDeleted ?? rawRepliedTo.is_deleted ?? false,
        };
    }
    return {
        ...msg,
        sender: normalizeSender(msg.sender),
        image: thumbnail,
        imageOriginalUrl: original,
        createdAt: msg.createdAt ?? msg.created_at ?? '',
        editedAt: msg.editedAt ?? msg.edited_at ?? null,
        isDeleted: msg.isDeleted ?? msg.is_deleted ?? false,
        repliedTo,
    };
}

const api = useApi();

export const useConversations = () => {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: () =>
            api.get<IConversation[]>('/conversations/').then((res) => res.data),
    });
};

export const useMessages = (conversationId: Ref<number> | number) => {
    const idRef = isRef(conversationId) ? conversationId : toRef(conversationId);
    return useQuery({
        queryKey: computed(() => ['messages', idRef.value]),
        queryFn: () =>
            api
                .get<IMessage[]>(`/conversations/${idRef.value}/messages/`, {
                    params: { limit: 30 },
                })
                .then((res) => (Array.isArray(res.data) ? res.data : (res.data as any).results ?? res.data).map(normalizeMsg)),
        enabled: computed(() => !!idRef.value),
    });
};

export const useSendMessageRest = (conversationId: Ref<number> | number) => {
    const idRef = isRef(conversationId) ? conversationId : toRef(conversationId);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ISendMessage) => {
            const body: Record<string, unknown> = {};
            if (payload.text) body.text = payload.text;
            if (payload.imageId != null) body.image_id = payload.imageId;
            if (payload.repliedToId != null) body.replied_to_id = payload.repliedToId;
            return api
                .post<IMessage>(`/conversations/${idRef.value}/messages/`, body)
                .then((res) => normalizeMsg(res.data));
        },
        onSuccess: (newMsg) => {
            queryClient.setQueryData(
                ['messages', idRef.value],
                (old: IMessage[] | undefined) => {
                    if (!old) return [newMsg];
                    const exists = old.some(
                        (m) => m.id === newMsg.id || m.clientMessageId === newMsg.clientMessageId
                    );
                    if (exists) return old;
                    return [...old, newMsg];
                }
            );
        },
    });
};

export const useDeleteMessage = (conversationId: Ref<number> | number) => {
    const idRef = isRef(conversationId) ? conversationId : toRef(conversationId);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId: number) =>
            api.delete(`/messages/${messageId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', idRef.value] });
        },
    });
};

export const useEditMessage = (conversationId: Ref<number> | number) => {
    const idRef = isRef(conversationId) ? conversationId : toRef(conversationId);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ messageId, text }: { messageId: number; text: string }) =>
            api
                .patch<IMessage>(`/messages/${messageId}/`, { text })
                .then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', idRef.value] });
        },
    });
};

export const useUploadImage = () => {
    return useMutation({
        mutationFn: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return api
                .post<{ id: number; url: string }>('/upload/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((res) => res.data);
        },
    });
};
