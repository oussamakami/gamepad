import Chart from "./chartModule";
import {httpPromise} from "./browserModule";
import NavigationHandler from "./browserModule";
import ActionsHandler from "./actionsModule";

class ProfileLoader {
    //APIS
    private readonly statsAPI      : string;
    private readonly pictureAPI    : string;

    //DOM ELEMENTS
    private readonly profile       : HTMLElement;
    private readonly projection    : Chart;

    //MODULES
    private readonly navModule     : NavigationHandler;
    private readonly btnGenerator  : ActionsHandler;


    private profileData: Record<string, any> | undefined;

    constructor(baseAPI: string, navigationModule: NavigationHandler) {
        const elem = document.getElementById("profile");
        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.statsAPI = baseAPI + "/users";
        this.pictureAPI = baseAPI + "/picture";

        if (!elem)
            throw new Error("Profile element not found");

        this.profile = elem;
        this.projection = new Chart("user-projection-chart");

        this.navModule = navigationModule;
        this.btnGenerator = new ActionsHandler(baseAPI);
    }

    public get sessionUserId(): number {
        return (this.navModule.userData.userId);
    }

    public get chartTextColor(): string {
        return (this.projection.textColor);
    }

    public get chartBarColors(): Array<string> {
        return (this.projection.barColors);
    }

    public get chartTheme(): "light" | "dark" {
        return (this.projection.theme);
    }

    public set setChartTextColor(newColor: string) {
        this.projection.setTextColor = newColor;
    }

    public set setChartBarColors(newColor: Array<string>) {
        this.projection.setBarColors = newColor;
    }

    public set setChartTheme(newTheme: "light" | "dark") {
        this.projection.setTheme = newTheme;
    }

    private async fetchStats(): httpPromise {
        const url = new URLSearchParams(location.search);
        const targetid = url.get("id") || this.sessionUserId;
        const endpoint = `${this.statsAPI}/${targetid}`;

        try{
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include"  
            });

            if (!response.ok)
                throw response;

            this.profileData = (await response.json());
            return {httpCode: response.status, httpName: response.statusText};
        }
        catch (error) {
            throw {httpCode: error.status, httpName: error.statusText};
        }
    }

    private updateProfileInfo(): void {
        if (!this.profileData) return;

        const picture  = this.profile.querySelector("[data-user-img]") as HTMLImageElement;
        const data     = this.profile.querySelector("figcaption");
        const id       = data?.querySelector("[data-user-id]");
        const name     = data?.querySelector("[data-user-name]");
        const email    = data?.querySelector("[data-user-email]");
        const isonline = data?.querySelector("[data-user-status]")?.querySelector("i");
        
        data?.querySelector(".btn-container")?.remove();
        
        id       && (id   .textContent  = this.profileData.id);
        name     && (name .textContent  = this.profileData.username);
        email    && (email.textContent  = this.profileData.email);
        picture  && (picture.src        = `${this.pictureAPI}/${this.profileData.id}`);
        isonline && (isonline.className = this.profileData.isOnline ? "user-online" : "user-offline");
        
        if (this.profileData.id != this.sessionUserId) {
            const buttons = this.btnGenerator.generateBtnContainer(this.profileData.id, this.profileData.friendship);
            data?.appendChild(buttons);
        }
    }

    private updateStats(): void {
        if (!this.profileData) return;

        const TotalWon = this.profile.querySelector("[data-user-won-count]");
        const TotalLost = this.profile.querySelector("[data-user-lost-count]");
        const TotalPlayed = this.profile.querySelector("[data-user-games-count]");

        TotalWon    && (TotalWon   .textContent = this.profileData.wins.total);
        TotalLost   && (TotalLost  .textContent = this.profileData.loses.total);
        TotalPlayed && (TotalPlayed.textContent = this.profileData.total.total);
    }

    private updateProjection(): void {
        const TotalPerGame = {name: "games played", data: [0, 0, 0]};
        const WinsPerGame = {name: "games won", data: [0, 0, 0]};

        if (this.profileData) {
            TotalPerGame.data[0] = (this.profileData.total["ping-pong"]   ?? 0)
            TotalPerGame.data[1] = (this.profileData.total["tic-tac-toe"] ?? 0)
            TotalPerGame.data[2] = (this.profileData.total["rock-paper"]  ?? 0)

            WinsPerGame.data[0] = (this.profileData.wins["ping-pong"]   ?? 0)
            WinsPerGame.data[1] = (this.profileData.wins["tic-tac-toe"] ?? 0)
            WinsPerGame.data[2] = (this.profileData.wins["rock-paper"]  ?? 0)
        }
        
        this.projection.setCategories = ["ping-pong", "tic-tac-toe", "rock-paper-scissors"];
        this.projection.setDataSet = [TotalPerGame, WinsPerGame];
        this.projection.render();
    }

    private updateActivities(): void {
        const winningText = "emerged victorious over";
        const losingText = "suffered defeat at the hands of";
        const activities = this.profile.querySelector('#user-games-history .activity-list');

        if (!activities || !this.profileData) return;

        activities.innerHTML = (!this.profileData.history.length)
        ? `<p style="width: 100%; text-align: center;">Looks like there's no recent history yet!</p>`
        : "";

        this.profileData.history.forEach(record => {
            const icon = document.createElement("i");
            const text = document.createElement("span");
            const time = document.createElement("span");
            const listElem = document.createElement("li");

            icon.className = "bx card-icon";
            time.className = "activity-time";

            switch(record.game_type) {
                case 'ping-pong':
                    icon.classList.add("bx-meteor");
                    break;
                case 'tic-tac-toe':
                    icon.classList.add("bx-circle");
                    break;
                case 'rock-paper':
                    icon.classList.add("bx-cut");
                    break;
                default:
                    icon.classList.add("bx-question-mark");
            }

            record.isWinner || icon.classList.add("failure-icon");
            text.innerHTML = 
            `<strong>${record.user_username} (${record.user_nickname})</strong>
            ${record.isWinner ? winningText : losingText}
            <strong>${record.enemy_username} (${record.enemy_nickname})</strong>.
            `
            time.textContent = record.date;
            listElem.appendChild(icon);
            listElem.appendChild(text);
            listElem.appendChild(time);
            activities.appendChild(listElem);
        });
    }

    public async load(): httpPromise {
        return this.fetchStats()
        .then(result => {
            this.updateProfileInfo();
            this.updateStats();
            this.updateActivities();
            this.updateProjection();

            return (result);
        })
        .catch(error => {
            throw (error)
        });
    }
}

export default ProfileLoader;