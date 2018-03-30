import {Component, OnInit} from '@angular/core';
import { HubConnection } from '@aspnet/signalr';

@Component({
    selector: 'chatApp',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    private connection = new HubConnection('chat');
    name: string = '';
    message: string = '';
    publicMessages: Message[] = [];
    users: User[] = [];
    
    privateMessages: PrivateMessaging[] = [];
    
    MessageType : typeof MessageType = MessageType;
    
    ngOnInit() : void {
        
        let tempName = window.prompt('Your name: ', 'John Doe');
        this.name = tempName ? tempName : '';
        
        this.connection.on('send', (name: string,  receivedMessage: string) => {
            const text = name + ': ' + receivedMessage;
            this.publicMessages.push(new Message(text,  MessageType.Message));
        });

        this.connection.on('onClientJoinIntroduce', (name: string,  id: string) => {
            this.users.push(new User(name, id));
        });
        
        this.connection.on('onClientDisconnect', (id:string) => {
           this.users = this.users.filter(user => user.id != id);
        });
        
        this.connection.on('onClientJoin', (name: string, id: string) => {
            const text = name + ' joined our pity chat';
            
            this.users.push(new User(name, id));
            this.publicMessages.push(new Message(text,  MessageType.Action));
            
            this.connection
                .invoke('onClientJoinIntroduce', this.name, id)
                .catch(error => console.log('The following error occured: ' + error.toString()));
        });
        
        this.connection
            .start()
            .then(() => {
                this.connection
                    .invoke('onClientJoin', this.name)
                    .catch(error => console.log('The following error occured: ' + error.toString()));
            })
            .catch(error => console.log('The following error occurred: ' + error.toString()));
    }
    
    public sendMessage() : void {
        this.connection
            .invoke('send', this.name, this.message)
            .catch(error => console.log('The following error occured: ' + error.toString()));
    }
    
}

export class Message {
    public content: string;
    public messageType: MessageType;
    
    public constructor(content: string, type: MessageType) {
        this.content = content;
        this.messageType = type;
    }
}

export class PrivateMessaging {
    public user: User;
    public messages: string[];
    
    public constructor(user:User) {
        this.user = user;
        this.messages = [];
    }
}

export enum MessageType {
    Action, Message
}

export class User {
    public name: string;
    public id: string;
    
    public constructor(name: string,  id: string) {
        this.name = name;
        this.id = id;
    }
}


