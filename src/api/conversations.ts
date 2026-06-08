import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
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

export const useMessages = (conversationId: number) => {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () =>
            api
                .get<IMessagesPage>(`/conversations/${conversationId}/messages/`, {
                    params: { limit: 30 },
                })
                .then((res) => res.data),
        enabled: !!conversationId,
    });
};

export const useSendMessage = (conversationId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ISendMessage) =>
            api
                .post<IMessage>(`/conversations/${conversationId}/messages/`, payload)
                .then((res) => res.data),
        onSuccess: (newMsg) => {
            queryClient.setQueryData(
                ['messages', conversationId],
                (old: IMessagesPage | undefined) => {
                    if (!old) return { results: [newMsg], nextCursor: null };
                    return { ...old, results: [...old.results, newMsg] };
                }
            );
        },
    });
};
