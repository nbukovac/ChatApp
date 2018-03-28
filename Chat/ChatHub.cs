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
            return Clients.All.SendAsync("onClientJoin", name);
        }
    }
}