
import { useApi } from '@/composables/useApi';

const api = useApi();





export const getLogin = <T>( payload: unknown) =>
    api
        .post<{ data: T }>(`/auth/login/`, payload,{ headers: { skipAuth: true } })
        .then((res) => res.data);