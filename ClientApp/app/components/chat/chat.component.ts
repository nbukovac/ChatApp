import {Component, OnInit} from '@angular/core';
import { HubConnection } from '@aspnet/signalr';

@Component({
    selector: 'chatApp',
    templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
    private connection = new HubConnection('chat');
    name: string = '';
    message: string = '';
    messages: string[] = [];
    
    ngOnInit() : void {
        
        let tempName = window.prompt('Your name: ', 'John Doe');
        this.name = tempName ? tempName : '';
        
        this.connection.on('send', (name: string,  receivedMessage: string) => {
            const text = name + ': ' + receivedMessage;
            this.messages.push(text);
        });
        
        this.connection.on('onClientJoin', (name: string) => {
            const text = name + ' joined our pity chat';
            this.messages.push(text);
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

