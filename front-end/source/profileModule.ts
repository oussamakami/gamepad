import Chart from "./chartModule";
import UserData from "./userModule";
import {httpPromise} from "./browserModule";

class ProfileLoader {
    private statsAPI: string;
    private pictureAPI: string;
    private projection: Chart;
    private profile: HTMLElement;
    private currentUser: UserData;
    private profileData: Record<string, any> | undefined;
    private profileUserId: number;

    constructor(statsAPI: string, pictureAPI: string, currentUser: UserData) {
        const elem = document.getElementById("profile");

        if (!elem)
            throw new Error("Profile element not found");

        this.profile = elem;
        this.projection = new Chart("user-projection-chart");
        this.statsAPI = statsAPI.endsWith("/") ? statsAPI : statsAPI + "/";
        this.pictureAPI = pictureAPI.endsWith("/") ? pictureAPI : pictureAPI + "/";
        this.currentUser = currentUser;
        this.profileUserId = -1;
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
        if (url.get("id"))
            this.profileUserId = +(url.get("id"))!;
        else
            this.profileUserId = this.currentUser.userId;

        const response = await fetch(this.statsAPI + this.profileUserId, {
            method: "GET",
            credentials: "include"
        }).catch(error => {throw new Error("Unknown error occurred")});

        if (!response.ok) {
            this.profileData = undefined;
            return Promise.reject({httpCode: response.status, httpName: response.statusText})
        }

        this.profileData = (await response.json());
        return Promise.resolve({httpCode: response.status, httpName: response.statusText});
    }

    private updateProfileInfo(): void {
        const picture = this.profile.querySelector("[data-user-img]") as HTMLImageElement;
        const name = this.profile.querySelector("[data-user-name]");
        const id = this.profile.querySelector("[data-user-id]");
        const email = this.profile.querySelector("[data-user-email]");
        const actionButtons = this.profile.querySelector(".btn-container");

        if (picture)
            picture.src = this.pictureAPI + this.profileUserId
        if (name)
            name.textContent = this.profileData?.username;
        if (id)
            id.textContent = this.profileData?.id;
        if (email)
            email.textContent = this.profileData?.email
        if (actionButtons) {
            if (this.profileData?.id != this.currentUser.userId)
                actionButtons.classList.remove("hidden");
            else
                actionButtons.classList.add("hidden");
        }
    }

    private updateStats(): void {
        const TotalPlayed = this.profile.querySelector("[data-user-games-count]");
        const TotalWon = this.profile.querySelector("[data-user-won-count]");
        const TotalLost = this.profile.querySelector("[data-user-lost-count]");

        if (TotalPlayed)
            TotalPlayed.textContent = this.profileData?.total.total;
        if (TotalWon)
            TotalWon.textContent = this.profileData?.wins.total;
        if (TotalLost)
            TotalLost.textContent = this.profileData?.loses.total;
    }

    private updateProjection(): void {
        const TotalPerGame = {name: "games played", data: [0, 0, 0]};
        const WinsPerGame = {name: "games won", data: [0, 0, 0]};

        if (this.profileData) {
            TotalPerGame.data[0] = (this.profileData.total["ping-pong"] ?? 0)
            TotalPerGame.data[1] = (this.profileData.total["tic-tac-toe"] ?? 0)
            TotalPerGame.data[2] = (this.profileData.total["rock-paper"] ?? 0)

            WinsPerGame.data[0] = (this.profileData.wins["ping-pong"] ?? 0)
            WinsPerGame.data[1] = (this.profileData.wins["tic-tac-toe"] ?? 0)
            WinsPerGame.data[2] = (this.profileData.wins["rock-paper"] ?? 0)
        }
        
        this.projection.setCategories = ["ping-pong", "tic-tac-toe", "rock-paper-scissors"];
        this.projection.setDataSet = [TotalPerGame, WinsPerGame];
        this.projection.render();
    }


    private updateActivities(): void {
        const winningText = "emerged victorious over";
        const losingText = "suffered defeat at the hands of";
        const activities = this.profile.querySelector('#user-games-history .activity-list');

        if (!activities)
            return;

        if (!this.profileData?.history.length)
            activities.innerHTML = `<p style="width: 100%; text-align: center;">Looks like there's no recent history yet!</p>`;
        else
            activities.innerHTML = "";

        this.profileData?.history.forEach(record => {
            const listElem = document.createElement("li");
            const icon = document.createElement("i");
            const text = document.createElement("span");
            const time = document.createElement("span");

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

            if (!record.isWinner)
                icon.classList.add("failure-icon");

            text.innerHTML = `<strong>${record.user_username} (${record.user_nickname})</strong> ${record.isWinner ? winningText : losingText} <strong>${record.enemy_username} (${record.enemy_nickname})</strong>.`;
            time.textContent = record.date;

            listElem.appendChild(icon);
            listElem.appendChild(text);
            listElem.appendChild(time);

            activities.appendChild(listElem);
        });
    }

    public async load(): httpPromise {
        return this.fetchStats().then(result => {
            this.updateProfileInfo();
            this.updateStats();
            this.updateActivities();
            this.updateProjection();
            return (result);
        }).catch(error => {throw error});
    }
}

export default ProfileLoader;