import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, toRef, isRef, type Ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IConversation } from '@/types/conversation';
import type { IMessage, IMessagesPage, ISendMessage } from '@/types/message';

const API_BASE = 'https://api.photoshade.ir';

function resolveImageUrl(raw: any): string | null {
    if (!raw) return null;
    if (typeof raw === 'object') {
        const path = raw.originalUrl ?? raw.original_url ?? raw.url ?? raw.file ?? raw.file_url ?? null;
        return resolveImageUrl(path);
    }
    if (typeof raw !== 'string') return null;
    if (raw.startsWith('http')) return raw;
    return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function normalizeMsg(msg: any): IMessage {
    return { ...msg, image: resolveImageUrl(msg.image ?? msg.image_url ?? null) };
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
