import { Message } from "./message";
import { User } from "./user";

export class PrivateMessaging {
    public user: User;
    public messages: Message[];

    public constructor(user:User) {
        this.user = user;
        this.messages = [];
    }
}