import {httpPromise} from "./browserModule";
import FormHandler from "./formsModule";
import UserData from "./userModule";
import ActionsHandler from "./actionsModule";

class SettingsLoader {
    //APIS
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
    private readonly btnGenerator : ActionsHandler;

    private settingsData: Record<string, any> | undefined;

    constructor(baseAPI: string, USER: UserData) {
        const elem = document.getElementById("settings");
        const profile = elem?.querySelector("#profile-settings-form");
        const security = elem?.querySelector("#security-settings-form");
        const sessions = elem?.querySelector("#sessions-list");
        const blockedList = elem?.querySelector("#blocked-list");
        const twofa = elem?.querySelector("#blocked-list");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.pictureAPI = baseAPI + "/picture";
        this.updateProfileAPI = baseAPI + "/settings/updateProfile"
        this.updatePassAPI = baseAPI + "/settings/updatePass"

        if (!elem || !profile || !security ||
            !sessions || !blockedList || !twofa)
            throw new Error("Settings Section not found");

        this.profileElem = profile as HTMLElement;
        this.securityElem = security as HTMLElement;
        this.sessionList = sessions as HTMLElement;
        this.blockedList = blockedList as HTMLElement;

        this.profileForm = new FormHandler(profile.id, this.updateProfileAPI, async (data) => {await USER.fetchSessionData(); this.load()});
        this.profileForm = new FormHandler(security.id, this.updatePassAPI);

        this.user = USER;
        this.btnGenerator = new ActionsHandler(baseAPI);
    }

    private updateProfileForm() {
        const img = this.profileElem.querySelector("[data-user-img]") as HTMLImageElement;
        const username = this.profileElem.querySelector("#settings-profile-name") as HTMLInputElement;
        const email = this.profileElem.querySelector("#settings-profile-email") as HTMLInputElement;

        img && ( img.src = `${this.pictureAPI}/${this.user.userId}?v=${Date.now()}` );
        username && ( username.value = this.user.userName );
        email && ( email.value = this.user.userEmail );
    }

    public load(): httpPromise {
        this.updateProfileForm();

        return Promise.resolve({httpCode: 200, httpName: "ok" });
    }
}

export default SettingsLoader;