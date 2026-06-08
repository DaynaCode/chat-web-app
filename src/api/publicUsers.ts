import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import type { IConversation } from '@/types/conversation';

export interface IPublicUser {
    id: number;
    username: string;
    displayName: string;
}

const api = useApi();

export const usePublicUsers = () => {
    return useQuery({
        queryKey: ['public-users'],
        queryFn: () => api.get<IPublicUser[]>('/public-users/').then((res) => res.data),
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) =>
            api
                .post<IConversation>('/conversations/', { type: 'private', userId })
                .then((res) => res.data),
        onSuccess: (conv) => {
            queryClient.setQueryData(
                ['conversations'],
                (old: IConversation[] | undefined) => {
                    if (!old) return [conv];
                    const exists = old.find((c) => c.id === conv.id);
                    if (exists) return old;
                    return [conv, ...old];
                }
            );
        },
    });
};
