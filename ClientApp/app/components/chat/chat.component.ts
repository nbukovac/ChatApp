import {Component, OnDestroy, OnInit} from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import { Message } from '../../models/message';
import { MessageType } from '../../enums/messageType';
import { User } from '../../models/user';
import {PrivateMessaging} from "../../models/privateMessaging";

@Component({
    selector: 'chatApp',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
    private connection = new HubConnection('chat');
    messageForm: FormGroup;
    
    name: string = '';
    publicMessages: Message[] = [];
    users: User[] = [];
    
    privateMessages: PrivateMessaging[] = [];
    
    MessageType: typeof MessageType = MessageType;
    
    constructor(private formBuilder: FormBuilder) {
        this.createForm();
    }
    
    private createForm() {
        this.messageForm = this.formBuilder.group({
            message: ['', Validators.required]
        });
    }
    private rebuildForm() {
        this.messageForm.reset({
            message: ''
        });
    }
    
    ngOnInit() : void {
        
        let tempName = window.prompt('Your name: ', 'John Doe');
        this.name = tempName ? tempName : '';
        
        this.prepareConnectionLogic();
    }
    
    ngOnDestroy() : void {
        this.connection.stop().catch(error => console.log('The following error occured: ' + error));
    }
    
    get message(): string {
        const control = this.messageForm.get('message');
        return control ? control.value : '';
    }
    
    private prepareConnectionLogic() : void {
        this.connection.on('onSendMessage', (name: string,  receivedMessage: string) => {
            const text = name + ': ' + receivedMessage;
            this.publicMessages.push(new Message(text,  MessageType.Message, false));
        });

        this.connection.on('onClientJoinIntroduce', (name: string,  id: string) => {
            this.users.push(new User(name, id));
        });

        this.connection.on('onClientDisconnect', (id:string) => {
            const user = this.users.filter(user => user.id == id)[0];
            const text = user.name + ' has left this chat';

            this.publicMessages.push(new Message(text,  MessageType.Action, false));
            
            this.users = this.users.filter(user => user.id != id);
        });

        this.connection.on('onClientJoin', (name: string, id: string) => {
            const text = name + ' joined our pity chat';

            this.users.push(new User(name, id));
            this.publicMessages.push(new Message(text,  MessageType.Action, false));

            this.connection
                .invoke('onClientJoinIntroduce', this.name, id)
                .catch(error => console.log('The following error occured: ' + error));
        });

        this.connection.on('onSendPrivateMessage', (id:string,  privateMessage: string) => {
            let userPM = this.privateMessages.filter(pm => pm.user.id == id);
            const newMessage = new Message(privateMessage, MessageType.Message, false);

            userPM[0].messages.push(newMessage);
        });

        this.connection
            .start()
            .then(() => {
                this.connection
                    .invoke('onClientJoin', this.name)
                    .catch(error => console.log('The following error occured: ' + error));
            })
            .catch(error => console.log('The following error occurred: ' + error));
    }
    
    public sendMessage() : void {
        this.publicMessages.push(new Message(this.message, MessageType.Message, true));
        this.connection
            .invoke('onSendMessage', this.name, this.message)
            .catch(error => console.log('The following error occured: ' + error));
        
        this.rebuildForm();
    }
    
    public sendPrivateMessaeg(userId: string, message: string) : void {
        this.connection
            .invoke('onSendPrivateMessage', userId, message)
            .catch(error => console.log('The following error occured: ' + error));
    }
    
}



