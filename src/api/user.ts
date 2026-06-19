import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import type { IUserProfile, IUpdateUserProfile, IAuthMe } from '@/types/user';
import type { ComputedRef } from 'vue';

const api = useApi();

export const useAuthMe = () => {
    return useQuery({
        queryKey: ['auth-me'],
        queryFn: () =>
            api
                .get<IAuthMe>('/auth/me/', { showErrorToast: false } as any)
                .then((res) => res.data)
                .catch(() => null),
        retry: false,
    });
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: () => api.get<IUserProfile>('/profile/').then((res) => res.data),
    });
};

export const usePublicProfile = (username: ComputedRef<string | null>) => {
    return useQuery({
        queryKey: ['public-profile', username],
        queryFn: () =>
            api.get<IUserProfile>(`/profile/${username.value}/`).then((res) => res.data),
        enabled: () => !!username.value,
        retry: false,
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IUpdateUserProfile) => {
            const formData = new FormData();
            if (data.displayName !== undefined) formData.append('display_name', data.displayName);
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
