import {httpPromise} from "./browserModule";
import FormHandler from "./formsModule";
import UserData from "./userModule";
import ActionsHandler from "./actionsModule";
import NavigationHandler from "./browserModule";

class SettingsLoader {
    //APIS
    private readonly dataAPI          : string;
    private readonly logoutAPI        : string;
    private readonly pictureAPI       : string;
    private readonly updatePassAPI    : string;
    private readonly updateProfileAPI : string;

    //DOM ELEMENTS
    private readonly profileElem  : HTMLElement;
    private readonly securityElem : HTMLElement;
    private readonly sessionList  : HTMLElement;
    private readonly blockedList  : HTMLElement;

    private readonly profileForm  : FormHandler;
    private readonly securityForm : FormHandler;

    //MODULES
    private readonly user         : UserData;
    private readonly navModule     : NavigationHandler;
    private readonly btnGenerator : ActionsHandler;

    private settingsData: Record<string, any> | undefined;

    constructor(baseAPI: string, navigationModule: NavigationHandler) {
        const elem = document.getElementById("settings");
        const profile = elem?.querySelector("#profile-settings-form");
        const security = elem?.querySelector("#security-settings-form");
        const sessions = elem?.querySelector("#sessions-list");
        const blockedList = elem?.querySelector("#blocked-list");
        const twofa = elem?.querySelector("#blocked-list");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.dataAPI = baseAPI + "/settings/data";
        this.logoutAPI = baseAPI + "/logout";
        this.pictureAPI = baseAPI + "/picture";
        this.updateProfileAPI = baseAPI + "/settings/updateProfile";
        this.updatePassAPI = baseAPI + "/settings/updatePass";

        if (!elem || !profile || !security ||
            !sessions || !blockedList || !twofa)
            throw new Error("Settings Section not found");

        this.profileElem = profile as HTMLElement;
        this.securityElem = security as HTMLElement;
        this.sessionList = sessions as HTMLElement;
        this.blockedList = blockedList as HTMLElement;

        this.profileForm = new FormHandler(profile.id, this.updateProfileAPI, async (data) => {navigationModule.reloadPage()});
        this.profileForm = new FormHandler(security.id, this.updatePassAPI);

        this.navModule = navigationModule;
        this.user = navigationModule.userData;
        this.btnGenerator = new ActionsHandler(baseAPI);

        const closeAllSessionsbtn = elem.querySelector("#closeAllSessions");
        if (closeAllSessionsbtn)
            closeAllSessionsbtn.addEventListener("click", () => this.closeAllSessions());
    }

    private async fetchData(): httpPromise {
        try{
            const response = await fetch(this.dataAPI, {method: "GET", credentials: "include"});

            if (!response.ok)
                throw response;

            this.settingsData = (await response.json());
            return {httpCode: response.status, httpName: response.statusText};
        }
        catch (error) {
            throw {httpCode: error.status, httpName: error.statusText};
        }
    }

    private updateProfileForm() {
        const img = this.profileElem.querySelector("[data-user-img]") as HTMLImageElement;
        const username = this.profileElem.querySelector("#settings-profile-name") as HTMLInputElement;
        const email = this.profileElem.querySelector("#settings-profile-email") as HTMLInputElement;

        img && ( img.src = `${this.pictureAPI}/${this.user.userId}?v=${Date.now()}` );
        username && ( username.value = this.user.userName );
        email && ( email.value = this.user.userEmail );
    }

    private createSessionItem(token_id: number, title: string, current: boolean = false) {
        const item = document.createElement("li");

        item.className = "sessions-item";

        item.innerHTML = `
            <strong>${title}</strong>
            ${current ? "<label>current</label>" : ""}
            <button class="btn">logout</button>
        `;

        const button = item.querySelector("button")!;

        button.onclick = async () => {
            const endpoint = `${this.logoutAPI}/${token_id}`;

            try{
                const response = await fetch(endpoint, {method: "GET", credentials: "include"});
    
                if (!response.ok)
                    throw new Error(`Failed to close session`);
                if (current)
                    this.navModule.navigateTo("/");
                item.remove();
            }
            catch (error) {
                console.error(error.message);
            }
        };

        return (item);
    }

    private creatBlockeditem(userId: number, username: string) {
        const item = document.createElement("li");

        item.className = "blocked-item";

        item.innerHTML = `
            <img src="${this.pictureAPI}/${userId}" alt="profile picture">
            <strong>${username}</strong>
        `;

        item.appendChild(this.btnGenerator.generateActionButton("unblock", userId));

        const button = item.querySelector("button")!;
        button.onclick = () => item.remove();

        return (item);
    }

    private updateSessionsList() {
        if (!this.settingsData) return;

        this.sessionList.innerHTML = "";

        this.settingsData.sessions.forEach(session => {
            this.sessionList.appendChild(this.createSessionItem(session.token_id, session.title, session.current));
        })
    }

    private updateBlockedList() {
        if (!this.settingsData) return;

        this.blockedList.innerHTML = "";

        this.settingsData.blocked.forEach(user => {
            this.blockedList.appendChild(this.creatBlockeditem(user.id, user.username));
        })

        if (!this.blockedList.innerHTML.length)
            this.blockedList.innerHTML = "<p>You haven’t blocked anyone yet.</p>"
    }


    private closeAllSessions() {
        if (!this.settingsData) return;

        const sessions = [...this.settingsData.sessions].reverse();
        sessions.forEach(async session => {
            try{
                const endpoint = `${this.logoutAPI}/${session.token_id}`;
                const response = await fetch(endpoint, {method: "GET", credentials: "include"});
    
                if (!response.ok)
                    throw new Error(`Failed to close session`);
            }
            catch (error) {
                console.error(error.message);
            }
        });
        this.navModule.navigateTo("/");
    }

    public async load(): httpPromise {
        return this.fetchData()
        .then(result => {
            this.updateProfileForm();
            this.updateSessionsList();
            this.updateBlockedList();

            return (result);
        })
        .catch(error => {
            throw (error)
        });
    }
}

export default SettingsLoader;