using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Chat
{
    public class ChatHub : Hub
    {
        public Task Send(string name, string message)
        {
            return Clients.All.SendAsync("send", name, message);
        }

        public Task OnClientJoin(string name)
        {
            return Clients.Others.SendAsync("onClientJoin", name, Context.ConnectionId);
        }
        
        public Task OnClientJoinIntroduce(string name, string id)
        {
            return Clients.Client(id).SendAsync("onClientJoinIntroduce", name, Context.ConnectionId);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            return Clients.Others.SendAsync("onClientDisconnect", Context.ConnectionId);
        }

        public Task SendPrivateMessage(string receiverId, string senderId, string message)
        {
            return Clients.Client(receiverId).SendAsync("sendPrivateMessage", senderId, message);
        }
    }
}