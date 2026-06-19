import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import type { IConversation } from '@/types/conversation';
import type { Ref } from 'vue';

export interface IPublicUser {
    id: number;
    username: string;
    displayName: string;
}

export interface IPublicUserProfile extends IPublicUser {
    bio: string | null;
    avatar: string | null;
}

const api = useApi();

export const usePublicUsers = () => {
    return useQuery({
        queryKey: ['public-users'],
        queryFn: () => api.get<IPublicUser[]>('/public-users/').then((res) => res.data),
    });
};

export const usePublicUserProfile = (userId: Ref<number | null>) => {
    return useQuery({
        queryKey: ['public-user-profile', userId],
        queryFn: () =>
            api.get<IPublicUserProfile>(`/public-users/${userId.value}/`).then((res) => res.data),
        enabled: () => userId.value != null && userId.value > 0,
    });
};

export const useCreateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) =>
            api
                .post<IConversation>('/conversations/', { type: 'private', user_id: userId })
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
