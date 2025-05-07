import {httpPromise} from "./browserModule";
import FormHandler from "./formsModule";
import UserData from "./userModule";
import ActionsHandler from "./actionsModule";
import NavigationHandler from "./browserModule";

class SettingsLoader {
    //APIS
    private readonly baseAPI          : string;
    private readonly dataAPI          : string;
    private readonly logoutAPI        : string;
    private readonly pictureAPI       : string;
    private readonly updatePassAPI    : string;
    private readonly updateProfileAPI : string;
    private readonly updateTwoFaAPI   : string;

    //DOM ELEMENTS
    private readonly profileElem  : HTMLElement;
    private readonly securityElem : HTMLElement;
    private readonly sessionList  : HTMLElement;
    private readonly blockedList  : HTMLElement;
    private readonly twoFaElem    : HTMLElement;

    private readonly profileForm  : FormHandler;
    private readonly securityForm : FormHandler;
    private readonly twoFaForm : FormHandler;

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
        const twofa = elem?.querySelector("#twofa-settings-form");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, -1) : baseAPI;

        this.baseAPI = baseAPI;
        this.dataAPI = baseAPI + "/settings/data";
        this.logoutAPI = baseAPI + "/logout";
        this.pictureAPI = baseAPI + "/picture";
        this.updateProfileAPI = baseAPI + "/settings/updateProfile";
        this.updatePassAPI = baseAPI + "/settings/updatePass";
        this.updateTwoFaAPI = baseAPI + "/settings/updateTwoFa";

        if (!elem || !profile || !security ||
            !sessions || !blockedList || !twofa)
            throw new Error("Settings Section not found");

        this.profileElem = profile as HTMLElement;
        this.securityElem = security as HTMLElement;
        this.sessionList = sessions as HTMLElement;
        this.blockedList = blockedList as HTMLElement;
        this.twoFaElem = twofa as HTMLElement;

        this.securityForm = new FormHandler(security.id, this.updatePassAPI);
        this.twoFaForm    = new FormHandler(twofa.id, this.updateTwoFaAPI, async (data) => {navigationModule.reloadPage()});
        this.profileForm  = new FormHandler(profile.id, this.updateProfileAPI, async (data) => {navigationModule.reloadPage()});

        this.twoFaForm.setStatusVisibility = false;

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

    private updateSecurityForm() {
        if (!this.settingsData) return;

        const googlebtn = this.securityElem.querySelector(".google-btn") as HTMLButtonElement;

        if (!this.settingsData.hasPassword) {
            this.securityElem.querySelector(`label[for="settings-security-password"]`)?.remove();
            this.securityElem.querySelector("#settings-security-password")?.remove();
        }

        if (googlebtn) {
            if (this.settingsData.usesGoogle) {
                googlebtn.innerHTML = `
                    <img src="./assets/images/google_icon.png" alt="google logo">
                    Disconnect Google Account
                `;
                googlebtn.onclick = (e) => {
                    e.preventDefault();
                    location.href = `${this.baseAPI}/auth/google?unlink=true`;
                };
            }
            else {
                googlebtn.innerHTML = `
                    <img src="./assets/images/google_icon.png" alt="google logo">
                    Connect Google Account
                `;
                googlebtn.onclick = (e) => {
                    e.preventDefault();
                    location.href = `${this.baseAPI}/auth/google`;
                };
            }
        }
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
                if (current) {
                    this.user.clear();
                    this.navModule.navigateTo("/");
                }
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
        button.onclick = () => {
            item.remove();
            if (!this.blockedList.innerHTML.length)
                this.blockedList.innerHTML = "<p>You haven’t blocked anyone yet.</p>"
        };

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
        this.user.clear();
        this.navModule.navigateTo("/");
    }

    private handleTwoFa(): void {
        if (!this.settingsData) return;

        const status = this.twoFaElem.querySelector("label i");
        const options = this.twoFaElem.querySelector("#twofa-enable-section");
        const qrPicture = options?.querySelector("#twofa-qrcode") as HTMLImageElement;
        const qrSecret = options?.querySelector(".twofa-secret-code");
        const qrData = this.twoFaElem.querySelector("#twofa-qrcode-section");
        const actionBtn = this.twoFaElem.querySelector("#form-settings-action") as HTMLButtonElement;
        const abortBtn = this.twoFaElem.querySelector("#form-settings-abort") as HTMLButtonElement;



        if (status)
            status.className = this.settingsData.twofa ? "enabled" : "disabled";

        if (actionBtn) {
            actionBtn.classList.remove("hidden");
            if (this.settingsData.twofa) {
                actionBtn.innerHTML = "disable 2FA";
                actionBtn.onclick = () => this.twoFaForm.addToPayload("disable", "true");
            } else {
                actionBtn.innerHTML = "enable 2FA";
                actionBtn.onclick = (e) => {
                    e.preventDefault();
                    this.twoFaForm.addToPayload("disable", "false");
                    options?.classList.remove("hidden");
                    actionBtn.classList.add("hidden");
                };
            }
        }

        if (abortBtn) {
            abortBtn.onclick = (e) => {
                options?.classList.add("hidden");
                actionBtn?.classList.remove("hidden");
                this.twoFaForm.resetStatus();
            };
        }

        if (options) {
            options.classList.add("hidden");
            const emailOption = options.querySelector(`input[value="email"]`) as HTMLInputElement;
            const appOption = options.querySelector(`input[value="authenticator"]`) as HTMLInputElement;

            emailOption?.addEventListener("change", () => {
                if (emailOption.checked) qrData?.classList.add("hidden");
            });

            appOption?.addEventListener("change", () => {
                if (appOption.checked) qrData?.classList.remove("hidden");
            });

            if (appOption.checked) qrData?.classList.remove("hidden");
        }

        if (this.settingsData.twofa_secret) {
            if (qrPicture) qrPicture.src = this.settingsData.twofa_qrCode;
            if (qrSecret) qrSecret.innerHTML = this.settingsData.twofa_secret;
            this.twoFaForm.addToPayload("secret", this.settingsData.twofa_secret);
        }
    }

    public async load(): httpPromise {
        return this.fetchData()
        .then(result => {
            this.updateProfileForm();
            this.updateSecurityForm();
            this.updateSessionsList();
            this.updateBlockedList();
            this.handleTwoFa();

            const url = new URLSearchParams(location.search);
            const error = url.get("error");
            if (error)
                this.securityForm.showError(error);

            return (result);
        })
        .catch(error => {
            throw (error)
        });
    }
}

export default SettingsLoader;