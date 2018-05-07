import { MessageType } from "../enums/messageType";

export class Message {
    public content: string;
    public messageType: MessageType;
    public sentByMe: boolean;

    public constructor(content: string, type: MessageType, sentByMe: boolean) {
        this.content = content;
        this.messageType = type;
        this.sentByMe = sentByMe;
    }
} {
    
}
