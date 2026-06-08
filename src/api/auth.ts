import { useMutation } from '@tanstack/vue-query';

import { getLogin } from '.';

import type { ILogIn } from '@/types/auth';



const login = async (payload: ILogIn) => {
    const res = await getLogin<{ data: ILogIn }>(payload);
    return res.data;
};

export const useLogin = () => {
    return useMutation({
        mutationFn: login,
    });
};

// const login = async (payload: ILogIn) => {
//     const response = await getLogin<{ data: ILogIn }>(payload);
//
//     return response.data;
// };
//
// export const useLogin = (data: ILogIn) => {
//     return useQuery({
//         queryKey: ['login', data],
//         queryFn: () => login(data),
//         enabled: false
//     });
// };