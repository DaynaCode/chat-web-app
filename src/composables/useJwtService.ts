import { ref, computed } from 'vue';
import { JWTModel, type DecodedJwtPayload } from '@/types/jwt';
import { jwtDecode } from 'jwt-decode';

const JWT_KEY = 'JWT_USER';

const jwt = ref<JWTModel | null>(null);

function decodeToken(token: string): DecodedJwtPayload | null {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}

export function useJwtService() {
    function init() {
        const token = get();
        if (token) {
            const decodedToken = decodeToken(token);
            if (decodedToken) {
                jwt.value = new JWTModel(decodedToken);
            }
        }
    }

    if (jwt.value === null) {
        init();
    }

    function get(index?: number): string {
        const jwtUser = localStorage.getItem(JWT_KEY) || '';

        const jwtUsers = jwtUser.split('|');

        if (jwtUsers.length >= 2) {
            if (typeof index === 'number' && jwtUsers[index]) {
                return jwtUsers[index];
            } else {
                return jwtUsers[jwtUsers.length - 1];
            }
        }
        return jwtUser;
    }

    function set(token: string): void {
        localStorage.setItem(JWT_KEY, token);
        const decodedToken = decodeToken(token);
        if (decodedToken) {
            jwt.value = new JWTModel(decodedToken);
        }
    }

    function remove(): void {
        localStorage.removeItem(JWT_KEY);
        jwt.value = null;
    }

    const hasToken = computed<boolean>(() => {
        return !!get();
    });

    const isExpired = computed<boolean>(() => {
        if (jwt.value) {
            return Math.floor(Date.now() / 1000) > jwt.value.expireAt;
        }
        return true;
    });

    const hasScope = (scopeName: string): boolean => {
        if (jwt.value) {
            return jwt.value.scopes.includes(scopeName);
        }
        return false;
    };

    const addSubuser = (token: string): void => {
        const currentToken = get();
        const newToken = currentToken ? `${currentToken}|${token}` : token;
        set(newToken);
    };

    const removeSubUser = (): void => {
        const jwtUsers: string[] = (localStorage.getItem(JWT_KEY) || '').split(
            '|'
        );
        if (jwtUsers.length > 1) {
            jwtUsers.pop();
        }
        set(jwtUsers.join('|'));
    };

    const isLoginWithSubUser = computed<boolean>(() => {
        const jwtUser = localStorage.getItem(JWT_KEY);
        if (jwtUser) {
            const jwtUsers = jwtUser.split('|');
            return jwtUsers.length >= 2;
        }
        return false;
    });

    return {
        init,
        jwt,
        get,
        set,
        remove,
        hasToken,
        isExpired,
        hasScope,
        addSubuser,
        removeSubUser,
        isLoginWithSubUser
    };
}
