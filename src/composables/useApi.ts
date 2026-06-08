import axios from 'axios';
import { useJwtService } from '@/composables/useJwtService';
import { toast } from 'vue3-toastify';




const api = axios.create({
    baseURL: 'http://api.photoshade.ir/api/',
    timeout: 35000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if ((config.headers as any).skipAuth) {
            delete (config.headers as any).skipAuth;
            return config;
        }
        const { get } = useJwtService();
        const token = (config.headers as any).useFirstToken ? get(0) : get();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if ((config.headers as any).useFirstToken) {
            delete (config.headers as any).useFirstToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
    
        const errorMessage=error.response.data.detailFa
        const status = error.response?.status;
        const showErrorToast = error.config?.showErrorToast ?? true;

        //  If error is network or timeout
        if (error.code === 'ECONNABORTED') {
            toast.error('مهلت درخواست به پایان رسید.');
            return Promise.reject(error);
        }

        if (!error.response) {
            toast.error(
                'خطای شبکه رخ داده است. لطفاً اتصال اینترنت خود را بررسی کنید.'
            );
            return Promise.reject(error);
        }

        //  Handle auth errors
        if (status === 401) {
            const { remove } = useJwtService();
            remove();
            toast.error(errorMessage ||'دسترسی غیرمجاز است. لطفاً دوباره وارد شوید.');
            return Promise.reject(error);
        }

        //  Ignore 403, 404 for now (can be handled by components)
        if ([403, 404].includes(status)) {
            return Promise.reject(error);
        }

        // Handle server errors
        if (status >= 500) {
            if (showErrorToast)
                toast.error('سرور با خطا مواجه شد. لطفاً دوباره تلاش کنید.');

            return Promise.reject(error);
        }

        //  Handle all other validation/client errors (e.g. 400, 422)
        const errorData =
            error.response?.data?.error || error.response?.data?.errors || {};
        const details = errorData.details;
        let hasShown = false;

        if (details) {
            // errors with details property
            if (Array.isArray(details) && details.length) {
                if (showErrorToast) {
                    details.forEach((err: string) => {
                        toast.error(err, { autoClose: 6000 });
                        hasShown = true;
                    });
                }
            } else if (
                typeof details === 'object' &&
                details !== null &&
                !Array.isArray(details)
            ) {
                if (showErrorToast) {
                    Object.entries(details).forEach(([, errors]) => {
                        if (Array.isArray(errors)) {
                            errors.forEach((err: string) => {
                                toast.error(err, { autoClose: 6000 });
                                hasShown = true;
                            });
                        } else if (typeof errors === 'string') {
                            toast.error(errors, { autoClose: 6000 });
                            hasShown = true;
                        }
                    });
                }
            }
        } else {
            //errors without details property
            if (Array.isArray(errorData) && errorData.length) {
                if (showErrorToast) {
                    errorData.forEach((err: string) => {
                        toast.error(err, { autoClose: 6000 });
                        hasShown = true;
                    });
                }
            }
        }

        if (!hasShown) {
            const message =
                errorData.message ||
                error.message ||
                'خطای نامشخصی رخ داده است.';
            if (showErrorToast) toast.error(message, { autoClose: 6000 });
        }

        return Promise.reject(error);
    }
);

export const useApi = () => api;
