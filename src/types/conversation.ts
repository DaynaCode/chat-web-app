export interface IParticipant {
    id: number;
    username: string;
    displayName: string;
}

export interface ILastMessage {
    id: number;
    text: string | null;
    createdAt: string;
    sender: IParticipant;
}

export interface IGroupInfo {
    id: number;
    name: string;
    groupImage: string | null;
}

export interface IConversation {
    id: number;
    type: 'private' | 'group';
    participants: IParticipant[];
    lastMessage: ILastMessage | null;
    group: IGroupInfo | null;
    createdAt: string;
}
