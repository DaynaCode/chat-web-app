import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import type { IUserProfile, IUpdateUserProfile } from '@/types/user';

const api = useApi();

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: () => api.get<IUserProfile>('/profile/').then((res) => res.data),
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IUpdateUserProfile) =>
            api.patch<IUserProfile>('/profile/', data).then((res) => res.data),
        onSuccess: (data) => {
            queryClient.setQueryData(['user-profile'], data);
        },
    });
};
