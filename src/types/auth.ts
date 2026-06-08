export interface ILogIn {
    username: string;
    password: string;
}

export interface ILoginResponse {
    detail: string;
    faMessage: string;
    access: string;
    refresh: string;
}
