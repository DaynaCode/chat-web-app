import { useQuery, useMutation, useQueryClient, type MaybeRef } from '@tanstack/vue-query';
import { computed, toRef, isRef, type Ref } from 'vue';
import { useApi } from '@/composables/useApi';
import type { IConversation } from '@/types/conversation';
import type { IMessage, IMessagesPage, ISendMessage } from '@/types/message';

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
                .get<IMessagesPage>(`/conversations/${idRef.value}/messages/`, {
                    params: { limit: 30 },
                })
                .then((res) => res.data),
        enabled: computed(() => !!idRef.value),
    });
};

export const useSendMessageRest = (conversationId: Ref<number> | number) => {
    const idRef = isRef(conversationId) ? conversationId : toRef(conversationId);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ISendMessage) =>
            api
                .post<IMessage>(`/conversations/${idRef.value}/messages/`, payload)
                .then((res) => res.data),
        onSuccess: (newMsg) => {
            queryClient.setQueryData(
                ['messages', idRef.value],
                (old: IMessagesPage | undefined) => {
                    if (!old) return { results: [newMsg], nextCursor: null };
                    const exists = old.results.some(
                        (m) => m.id === newMsg.id || m.clientMessageId === newMsg.clientMessageId
                    );
                    if (exists) return old;
                    return { ...old, results: [...old.results, newMsg] };
                }
            );
        },
    });
};
