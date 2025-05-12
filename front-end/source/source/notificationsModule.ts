class notificationHandler {

    //DOM ELEMENTS
    private readonly button       : HTMLElement;
    private readonly badge        : HTMLElement;
    private readonly list         : HTMLElement;
    private readonly dropDownMenu : HTMLElement;

    // Icon mappings
    private readonly iconMap: Record<string, string> = {
        friendship: "bx-user-plus",
        message: "bx-message-rounded",
        tournament: "bx-joystick",
        default: "bx-question-mark"
    };

    constructor() {
        const elem = document.getElementById("notification-btn");
        const badge = elem?.querySelector(".notification-badge");
        const dropdown = elem?.querySelector(".notification-dropdown");
        const list = elem?.querySelector(".notification-list");

        if (!elem || !badge || !dropdown || !list)
            throw new Error("Notifications element not found");

        this.button = elem;
        this.badge = badge as HTMLElement;
        this.list = list as HTMLElement;
        this.dropDownMenu = dropdown as HTMLElement;

        this.resetNotifications();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.button.addEventListener("click", (e) => {
            this.hideNotificationBadge();
            this.dropDownMenu.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (!this.button.contains(e.target as Node))
                this.dropDownMenu.classList.remove("active");
        });
    }

    private showNotificationBadge() {
        if (!this.dropDownMenu.classList.contains("active"))
            this.badge.classList.remove("hidden");
    }

    private hideNotificationBadge() {
        this.badge.classList.add("hidden");
    }

    private resetNotifications() {
        this.dropDownMenu.classList.remove("active");
        this.hideNotificationBadge();
        this.list.innerHTML = "";
    }

    private createNotificationItem(action:string, targetUrl:string, message: string) {
        const icon = this.iconMap[action] || this.iconMap.default;
        const item = document.createElement("li");
        item.className = "notification-item";

        item.innerHTML = `
            <a href="${targetUrl || "#"}">
                <i class='notification-icon bx ${icon}'></i>
                <p class="notification-message">${message || ""}</p>
            </a>
        `;

        return (item);
    }

    public addNotification(data: any) {
        if (data.type !== "notification") return;
        const item = this.createNotificationItem(data.action, data.targetUrl, data.message);

        this.list.appendChild(item);
        this.showNotificationBadge();
    }
}

const NOTIFICATIONS = new notificationHandler;

export default NOTIFICATIONS;