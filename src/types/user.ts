export interface IUserProfile {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    avatar: string | null;
}

export interface IUpdateUserProfile {
    first_name: string;
    last_name: string;
    avatar?: string | null;
}
