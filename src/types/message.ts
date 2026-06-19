export interface IMessageSender {
    id: number;
    username: string;
    displayName?: string;
}

export interface IMessage {
    id: number;
    conversation: number;
    conversationId?: number;
    sender: IMessageSender;
    text: string | null;
    image: string | null;
    imageOriginalUrl: string | null;
    createdAt: string;
    editedAt: string | null;
    isDeleted: boolean;
    repliedTo: IMessage | null;
    clientMessageId?: string;
}

export interface IMessagesPage {
    results: IMessage[];
    nextCursor: string | null;
}

export interface ISendMessage {
    text?: string;
    repliedToId?: number | null;
    imageId?: number | null;
}
