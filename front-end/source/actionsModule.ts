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
    private readonly buttonConfigs: Record<RelationActions, ButtonConfig> = {
        add:      { text: "Add",      isDanger: false },
        cancel:   { text: "Cancel",   isDanger: false },
        accept:   { text: "Accept",   isDanger: false },
        decline:  { text: "Decline",  isDanger: false },
        unfriend: { text: "Unfriend", isDanger: false },
        block:    { text: "Block",    isDanger: true  },
        unblock:  { text: "Unblock",  isDanger: true  }
    };

    constructor(baseAPI: string) {
        this.targetAPI = `${baseAPI}/relations`;
    }

    private async handleButtonClick(event: Event, targetID: number) {
        const button = event.currentTarget as HTMLButtonElement;
        const action = button.dataset.action as RelationActions;
        const container = button.parentElement!;
        const isForList = container.dataset.for === "list";

        try {
            const response = await fetch(this.targetAPI, {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({action: action, target: targetID})
            });

            if (!response.ok)
                throw new Error();

            const text = await response.text();
            const friendship = text ? JSON.parse(text) : null;
            this.generateBtnContainer(targetID, friendship, isForList, container);
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

    public generateBtnContainer(target_id: number, friendsData?: RelationData, listContainer?: boolean, container?: HTMLElement) {
        container = container || document.createElement("div");
        container.className = "btn-container";
        container.innerHTML = "";
        container.dataset.for = listContainer ? "list" : "profile";

        const profileBtn = () => this.generateAnchorButton(`/profile?id=${target_id}`, "Profile");
        const messageBtn = () => this.generateAnchorButton(`/chat?user_id=${target_id}`, "Message");

        if (!friendsData) {
            container.append(
                this.generateActionButton("add", target_id),
                listContainer ? profileBtn() : messageBtn(),
                this.generateActionButton("block", target_id)
            );
        }
        else {
            switch (friendsData.status) {
                case "accepted":
                    container.append(
                        this.generateActionButton("unfriend", target_id),
                        listContainer ? profileBtn() : messageBtn(),
                        this.generateActionButton("block", target_id)
                    );
                    break;
                case "blocked":
                    container.append(this.generateActionButton("unblock", target_id));
                    break;
                case "pending":
                    if (friendsData.sender_id !== target_id) {
                        container.append(
                            this.generateActionButton("cancel", target_id),
                            listContainer ? profileBtn() : messageBtn(),
                            this.generateActionButton("block", target_id)
                        );
                    } else {
                        container.append(
                            this.generateActionButton("accept", target_id),
                            this.generateActionButton("decline", target_id),
                            ...(listContainer ? [profileBtn()] : []),
                            this.generateActionButton("block", target_id)
                        );
                    }
            }
        }

        return (container);
    }
}

export default ActionsHandler;