import NavigationHandler from "./browserModule";

type RelationActions =  "add"      | "cancel"  |
                        "accept"   | "decline" |
                        "unfriend" | "block"   |
                        "unblock";

interface RelationData {
    sender_id: number;
    target_id: number;
    status: string;
}

interface ButtonConfig {
    text: string;
    isDanger: boolean;
}

class ActionsHandler {
    private readonly targetAPI: string;
    private readonly navigation: NavigationHandler;
    private readonly buttonConfigs: Record<RelationActions, ButtonConfig> = {
        add:      { text: "Add Friend",     isDanger: false},
        cancel:   { text: "Cancel Request", isDanger: false},
        accept:   { text: "Accept",         isDanger: false},
        decline:  { text: "Decline",        isDanger: false},
        unfriend: { text: "Unfriend",       isDanger: false},
        block:    { text: "Block",          isDanger: true },
        unblock:  { text: "Unblock",        isDanger: true }
    };

    constructor(baseAPI: string, navigationModule: NavigationHandler) {
        this.targetAPI = `${baseAPI}/relations`;
        this.navigation = navigationModule;
    }

    private async handleButtonClick(event: Event, targetID: number) {
        const button = event.currentTarget as HTMLButtonElement;
        const action = button.dataset.action as RelationActions;

        try {
            const response = await fetch(this.targetAPI, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action: action, target: targetID})
            });

            if (!response.ok)
                throw new Error();

            if (action === "block") {
                button.textContent = "unblock";
                button.dataset.action = "unblock";
                return ;
            }

            this.navigation.reloadPage();
        }
        catch {
            console.error(`Failed to ${action} for user ${targetID}`);
        }
    }

    public generateActionButton(action: RelationActions, targetID: number): HTMLButtonElement {
        const button = document.createElement("button");
        const {text, isDanger} = this.buttonConfigs[action];

        button.dataset.action = action;
        button.innerText = text;
        button.className = isDanger ? "danger-btn" : "btn";
        button.onclick = (event) => this.handleButtonClick(event, targetID);

        return (button);
    }

    public generateAnchorButton(href: string, name:string) {
        const button = document.createElement("a");

        button.href = href;
        button.innerText = name;
        button.className = "btn";

        return (button);
    }

    public generateBtnContainer(targetID: number, friendshipData?: RelationData | undefined) {
        const container = document.createElement("div");

        container.className = "btn-container";

        if (!friendshipData)
            container.appendChild(this.generateActionButton("add", targetID));
        else if (friendshipData.status === "accepted")
            container.appendChild(this.generateActionButton("unfriend", targetID));
        else if (friendshipData.status === "pending") {
            if (friendshipData.sender_id === targetID) {
                container.appendChild(this.generateActionButton("accept", targetID));
                container.appendChild(this.generateActionButton("decline", targetID));
                container.appendChild(this.generateActionButton("block", targetID));
                return (container);
            }
            else
                container.appendChild(this.generateActionButton("cancel", targetID));
        }

        container.appendChild(this.generateAnchorButton(`/chat?user_id=${targetID}`, "Message"));
        container.appendChild(this.generateActionButton("block", targetID));

        return (container);
    }
}

export default ActionsHandler;