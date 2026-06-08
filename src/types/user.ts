export interface IUserProfile {
    id: number;
    username: string;
    displayName: string;
    bio: string | null;
    avatar: string | null;
}

export interface IUpdateUserProfile {
    displayName?: string;
    bio?: string;
    avatarFile?: File;
}

export interface IAuthMe {
    id: number;
    username: string;
    isActive: boolean;
    isStaff: boolean;
    displayName: string;
}
