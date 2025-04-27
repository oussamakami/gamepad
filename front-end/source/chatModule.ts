import {httpPromise} from "./browserModule";
import ActionsHandler from "./actionsModule";

class ChatLoader {
    //APIS
    private readonly chatAPI    : string;
    private readonly pictureAPI : string;

    //DOM ELEMENTS
    private readonly chatPage   : HTMLElement;
    private readonly chatList   : HTMLElement;
    private readonly chatBox    : HTMLElement;
    private readonly chatInfo   : HTMLElement;

    //MODULES
    private readonly btnGenerator  : ActionsHandler;

    private ChatData: Record<string, any> | undefined;
    private activeChat: Record<string, any> | undefined;

    constructor(baseAPI: string) {
        const elem = document.getElementById("chat");
        const chatList = elem?.querySelector("#chat-list")?.querySelector("ul");
        const chatBox = elem?.querySelector("#chat-box");
        const chatInfo = elem?.querySelector("#chat-info");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.chatAPI = baseAPI + "/chats";
        this.pictureAPI = baseAPI + "/picture";

        if (!elem || !chatList || !chatBox || !chatInfo)
            throw new Error("Chat Section not found");

        this.chatPage = elem;
        this.chatList = chatList as HTMLElement;
        this.chatBox = chatBox as HTMLElement;
        this.chatInfo = chatInfo as HTMLElement;

        this.btnGenerator = new ActionsHandler(baseAPI);
    }

    private async fetchStats(): httpPromise {
        const url = new URLSearchParams(location.search);
        const target = Number(url.get("user_id"));

        const endpoint = target ? `${this.chatAPI}?create=${target}` : this.chatAPI;
        this.activeChat = undefined;

        try{
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok)
                throw response;

            this.ChatData = (await response.json());

            return {httpCode: response.status, httpName: response.statusText};
        }
        catch (error) {
            throw {httpCode: error.status, httpName: error.statusText};
        }
    }

    private createChatItem(chatid: number, userid: number, username: string, lastMessage?: string, unread?: boolean) {
        const item = document.createElement("li");

        item.className = "chat-item";
        item.dataset.chatid = String(chatid);

        const data = `
            <a href="/chat?user_id=${userid}">
                <img src="${this.pictureAPI}/${userid}" alt="profile picture">
                <div class="info">
                    <h5>${username}<span class="notification ${!unread ? "hidden" : ""}"></span></h5>
                    <p>${lastMessage ? lastMessage : ""}</p>
                </div>
            </a>
        `;

        item.innerHTML = data;
        return (item);
    }

    private createMessageItem(message: string, date: string, isReceived: boolean) {
        const item = document.createElement("li");

        item.className = "message";
        item.classList.add(isReceived ? "receive" : "sent");

        const data = `
            <p>${message}</p>
            <span>${date}</span>
        `;

        item.innerHTML = data;
        return (item);
    }

    private updateChatList(): void {
        if (!this.ChatData) return;
        const url = new URLSearchParams(location.search);
        const target = Number(url.get("user_id"));

        this.chatList.innerHTML = "";
    
        this.ChatData.data.forEach(row => {
            let chatid = row.chat_id;
            let userid = row.id;
            let username = row.username;
            let lastMessage = row.messages?.at(-1)?.message;
            let unread = row.unread;

            if (target && userid === target)
                this.activeChat = row;

            this.chatList.appendChild(this.createChatItem(chatid, userid, username, lastMessage, unread));
        });

        if (!this.activeChat)
            this.activeChat = this.ChatData.data[0];

        this.chatList.querySelector(`[data-chatid="${this.activeChat?.chat_id}"]`)?.classList.add("active");
    }

    private updateChatBox() {
        if (!this.activeChat) return;

        console.log(this.activeChat);

        const chatUserImg = this.chatBox.querySelector("[data-chat-partner-image]") as HTMLImageElement;
        const chatUserName = this.chatBox.querySelector("[data-chat-partner-name]") as HTMLElement;
        const messagesBox = this.chatBox.querySelector("ul") as HTMLElement;
        
        if (!chatUserImg || !chatUserName || !messagesBox) return;

        chatUserImg.src = `${this.pictureAPI}/${this.activeChat.id}`;
        chatUserName.textContent = this.activeChat.username;
        messagesBox.innerHTML = "";

        this.activeChat.messages.forEach(message => {
            messagesBox.appendChild(this.createMessageItem(message.message, message.date, message.sender_id === this.activeChat?.id));
        })
        
        this.chatBox.classList.remove("hidden");
    }

    private updateChatInfo() {
        if (!this.activeChat) return;

        const ChatUserInfo = this.chatInfo.querySelector(".partner-info") as HTMLElement;
        const chatUserImg = ChatUserInfo.querySelector("[data-chat-partner-image]") as HTMLImageElement;
        const chatUserName = ChatUserInfo.querySelector("[data-chat-partner-name]") as HTMLElement;
        const chatUserId = ChatUserInfo.querySelector("[data-chat-partner-id]") as HTMLElement;
        const chatUserEmail = ChatUserInfo.querySelector("[data-chat-partner-email]") as HTMLElement;
        const chatUserWins = ChatUserInfo.querySelector("[data-chat-partner-wins]") as HTMLElement;
        const chatUserLoses = ChatUserInfo.querySelector("[data-chat-partner-loses]") as HTMLElement;

        if (!ChatUserInfo || !chatUserImg || !chatUserName ||
            !chatUserId || !chatUserEmail || !chatUserWins ||
            !chatUserLoses)
            return;

        chatUserImg.src = `${this.pictureAPI}/${this.activeChat.id}`;
        chatUserName.textContent = this.activeChat.username;
        chatUserId.textContent = this.activeChat.id;
        chatUserEmail.textContent = this.activeChat.email;
        chatUserWins.textContent = this.activeChat.wins;
        chatUserLoses.textContent = this.activeChat.loses;

        ChatUserInfo.querySelector(".btn-container")?.remove();
        ChatUserInfo.appendChild(this.btnGenerator.generateBtnContainer(this.activeChat.id, this.activeChat.friendship, true));

        this.chatInfo.classList.remove("hidden");
    }

    // private sendMessage(message: string) {
    //     if (!this.activeChat) return;

    //     const data = 

    // }


    public async load(): httpPromise {
        return this.fetchStats()
        .then(result => {
            this.updateChatList();
            this.updateChatBox();
            this.updateChatInfo();

            return (result);
        })
        .catch(error => {
            throw (error)
        });
    }
}

export default ChatLoader;