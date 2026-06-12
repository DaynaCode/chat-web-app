import { useMutation } from '@tanstack/vue-query';
import { useApi } from '@/composables/useApi';
import { useJwtService } from '@/composables/useJwtService';
import type { ILogIn, ILoginResponse } from '@/types/auth';
import type { IAuthMe } from '@/types/user';

const REFRESH_KEY = 'REFRESH_TOKEN';

const api = useApi();

const loginRequest = async (payload: ILogIn): Promise<ILoginResponse> => {
    const res = await api.post<ILoginResponse>('/auth/login/', payload, {
        headers: { skipAuth: true },
    });
    return res.data;
};

export const useLogin = () => {
    const { set } = useJwtService();
    return useMutation({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            set(data.access);
            localStorage.setItem(REFRESH_KEY, data.refresh);
        },
    });
};

export const useLogout = () => {
    const { remove } = useJwtService();
    return useMutation({
        mutationFn: async () => {
            const refresh = localStorage.getItem(REFRESH_KEY);
            await api.post('/auth/logout/', { refresh });
        },
        onSettled: () => {
            remove();
            localStorage.removeItem(REFRESH_KEY);
        },
    });
};

export const getAuthMe = (): Promise<IAuthMe> =>
    api.get<IAuthMe>('/auth/me/').then((res) => res.data);
