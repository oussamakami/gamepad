import {httpPromise} from "./browserModule";
import ActionsHandler from "./actionsModule";
import SocketHandler from "./SocketModule";

class ChatLoader {
    //APIS
    private readonly pictureAPI   : string;

    //DOM ELEMENTS
    private readonly chatPage     : HTMLElement;
    private readonly chatList     : HTMLElement;
    private readonly chatBox      : HTMLElement;
    private readonly chatInfo     : HTMLElement;

    //MODULES
    private readonly socket       : SocketHandler;
    private readonly btnGenerator : ActionsHandler;

    private ChatData: Record<string, any> | undefined;
    private activeChat: Record<string, any> | undefined;

    constructor(baseAPI: string, socketHandler: SocketHandler) {
        const elem = document.getElementById("chat");
        const chatList = elem?.querySelector("#chat-list")?.querySelector("ul");
        const chatBox = elem?.querySelector("#chat-box");
        const chatInfo = elem?.querySelector("#chat-info");
        const chatinput = chatBox?.querySelector("form") as HTMLFormElement;
        const deletebtn = chatBox?.querySelector("#delete-chat") as HTMLButtonElement;

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;
        this.pictureAPI = baseAPI + "/picture";

        if (!elem || !chatList || !chatBox ||
            !chatInfo || !chatinput || !deletebtn)
            throw new Error("Chat Section not found");

        this.chatPage = elem;
        this.chatList = chatList as HTMLElement;
        this.chatBox = chatBox as HTMLElement;
        this.chatInfo = chatInfo as HTMLElement;
        chatinput.onsubmit = (e) => this.sendMessage(e);
        deletebtn.onclick = (e) => this.deleteCurrentChat();

        this.btnGenerator = new ActionsHandler(baseAPI);
        this.socket = socketHandler;
    }

    public updateChatData(data: Record<string, any>) {
        this.ChatData = data.data;
        this.load();
    }

    private createChatItem(chatid: number, userid: number, username: string, messages?: Record<string, any>[]) {
        let lastMessage = undefined;
        let unread = false;
        const item = document.createElement("li");

        item.className = "chat-item";

        if (this.activeChat && this.activeChat.user_id == userid)
            item.classList.add("active");

        if (messages && messages.length) {
            lastMessage = messages[0].message;
            unread = messages[0].sender_id === userid;
        }

        const data = `
            <a href="/chat?user_id=${userid}">
                <img src="${this.pictureAPI}/${userid}" alt="profile picture">
                <div class="info">
                    <h5>${username}<span class="notification ${unread ? "" : "hidden"}"></span></h5>
                    <p>${lastMessage || ""}</p>
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

    private createNewChat(targetUser_id: number) {
        this.socket.send({type: "chat", action: "create", target_id: targetUser_id});
    }

    private deleteCurrentChat() {
        if (!this.activeChat) return;
        this.socket.send({type: "chat", action: "delete", chat_id: this.activeChat.chat_id});
        window.history.replaceState(null, "", location.pathname);
    } 

    private updateChatList(): void {
        if (!this.ChatData) return;

        const url = new URLSearchParams(location.search);
        const target = Number(url.get("user_id"));
        const keys = Object.keys(this.ChatData);

        if (!keys.length && !target)
            this.chatList.innerHTML = `<p style="padding:1rem 3rem;text-align:center;">You don’t have any active chats right now.</p>`;
        else
            this.chatList.innerHTML = "";

        this.activeChat = this.ChatData[keys[0]];
        if (target) {
            if (this.ChatData[target])
                this.activeChat = this.ChatData[target];
            else
                this.createNewChat(target);
        }

        keys.forEach(user_id => {
            let chat = this.ChatData![user_id];
            this.chatList.appendChild(this.createChatItem(chat.chat_id, chat.user_id, chat.username, chat.messages));
        });
    }

    private updateChatBox() {
        if (!this.activeChat) return;

        const chatUserImg = this.chatBox.querySelector("[data-chat-partner-image]") as HTMLImageElement;
        const chatUserName = this.chatBox.querySelector("[data-chat-partner-name]") as HTMLElement;
        const onlineStatus = this.chatBox.querySelector("[data-chat-partner-status]") as HTMLElement;
        const messagesBox = this.chatBox.querySelector("ul") as HTMLElement;
        
        if (!chatUserImg || !chatUserName || !messagesBox || !onlineStatus) return;

        chatUserImg.src = `${this.pictureAPI}/${this.activeChat.user_id}`;
        chatUserName.textContent = this.activeChat.username;
        onlineStatus.className = this.activeChat.isOnline ? "user-online" : "user-offline";
        messagesBox.innerHTML = "";

        this.activeChat.messages.forEach(message => {
            messagesBox.appendChild(this.createMessageItem(message.message, message.date, message.sender_id === this.activeChat!.user_id));
        })
        
        this.chatBox.classList.remove("hidden");
    }

    private updateChatInfo() {
        if (!this.activeChat) return;

        const ChatUserInfo = this.chatInfo.querySelector(".partner-info") as HTMLElement;
        const chatUserImg = ChatUserInfo.querySelector("[data-chat-partner-image]") as HTMLImageElement;
        const chatUserName = ChatUserInfo.querySelector("[data-chat-partner-name]") as HTMLElement;
        const onlineStatus = ChatUserInfo.querySelector("[data-chat-partner-status]") as HTMLElement;
        const chatUserId = ChatUserInfo.querySelector("[data-chat-partner-id]") as HTMLElement;
        const chatUserEmail = ChatUserInfo.querySelector("[data-chat-partner-email]") as HTMLElement;
        const chatUserWins = ChatUserInfo.querySelector("[data-chat-partner-wins]") as HTMLElement;
        const chatUserLoses = ChatUserInfo.querySelector("[data-chat-partner-loses]") as HTMLElement;

        if (!ChatUserInfo || !chatUserImg || !chatUserName ||
            !chatUserId || !chatUserEmail || !chatUserWins ||
            !chatUserLoses)
            return;

        chatUserImg.src = `${this.pictureAPI}/${this.activeChat.user_id}`;
        chatUserName.textContent = this.activeChat.username;
        onlineStatus.className = this.activeChat.isOnline ? "user-online" : "user-offline";
        chatUserId.textContent = this.activeChat.user_id;
        chatUserEmail.textContent = this.activeChat.email;
        chatUserWins.textContent = this.activeChat.wins;
        chatUserLoses.textContent = this.activeChat.loses;

        ChatUserInfo.querySelector(".btn-container")?.remove();
        ChatUserInfo.appendChild(this.btnGenerator.generateBtnContainer(this.activeChat.user_id, this.activeChat.friendship, true));

        this.chatInfo.classList.remove("hidden");
    }

    private sendMessage(event: SubmitEvent) {
        event.preventDefault();
        if (!this.activeChat) return;

        const form = event.target as HTMLFormElement;
        const input =form.querySelector("#message-input") as HTMLInputElement;
        const message = input.value.trim() || "";
        form.reset();

        if (!message.length) return;

        this.socket.send({
            type: "chat",
            action: "send",
            chat_id: this.activeChat.chat_id,
            target_id: this.activeChat.user_id,
            message: message
        });
    }


    public async load(): httpPromise {
        this.chatBox.classList.add("hidden");
        this.chatInfo.classList.add("hidden");
        this.updateChatList();
        this.updateChatBox();
        this.updateChatInfo();

        return {httpCode: 200, httpName: "ok"};
    }
}

export default ChatLoader;