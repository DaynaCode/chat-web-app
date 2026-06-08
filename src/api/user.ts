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
        mutationFn: (data: IUpdateUserProfile) => {
            const formData = new FormData();
            if (data.displayName !== undefined) formData.append('displayName', data.displayName);
            if (data.bio !== undefined) formData.append('bio', data.bio ?? '');
            if (data.avatarFile) formData.append('avatar', data.avatarFile);
            return api
                .patch<IUserProfile>('/profile/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                .then((res) => res.data);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user-profile'], data);
        },
    });
};
