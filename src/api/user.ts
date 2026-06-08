import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import type { IUserProfile, IUpdateUserProfile } from '@/types/user';

const api = useApi();

const fetchUserProfile = (userId: number) =>
    api.get<IUserProfile>(`/accounts/users/${userId}/`).then((res) => res.data);

const patchUserProfile = (payload: { userId: number; data: IUpdateUserProfile }) =>
    api
        .patch<IUserProfile>(`/accounts/users/${payload.userId}/`, payload.data)
        .then((res) => res.data);

export const useUserProfile = (userId: number) => {
    return useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchUserProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['user-profile', data.id], data);
        },
    });
};
