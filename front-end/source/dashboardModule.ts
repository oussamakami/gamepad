import Chart from "./chartModule";
import {httpPromise} from "./browserModule";
import NavigationHandler from "./browserModule";

class DashboardLoader {
    private statsAPI: string;
    private pictureAPI: string;
    private projection: Chart;
    private dashboard: HTMLElement;
    private navigation: NavigationHandler;
    private statsData: Record<string, any> | undefined;

    constructor(baseAPI: string, navigationModule: NavigationHandler) {
        if (baseAPI.endsWith("/"))
            baseAPI = baseAPI.slice(0, -1);

        const elem = document.getElementById("dashboard");
        if (!elem)
            throw new Error("Dashboard element not found");

        this.dashboard = elem;
        this.projection = new Chart("projection-chart");
        this.statsAPI = baseAPI + "/stats";
        this.pictureAPI = baseAPI + "/picture/";
        this.navigation = navigationModule;

        elem.querySelector("#dash-refresh")?.addEventListener("click", (event) => {
            this.projection.destroy();
            this.load();
        });
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
        const response = await fetch(this.statsAPI, {
            method: "GET",
            credentials: "include"
        }).catch(error => {throw new Error("Unknown error occurred")});

        if (!response.ok) {
            this.statsData = undefined;
            return Promise.reject({httpCode: response.status, httpName: response.statusText})
        }

        this.statsData = (await response.json());
        return Promise.resolve({httpCode: response.status, httpName: response.statusText});
    }

    private updateStatsCards(): void {
        const globalCount = this.dashboard.querySelector("[data-global-count]");
        const pongCount = this.dashboard.querySelector("[data-pong-count]");
        const tictacCount = this.dashboard.querySelector("[data-tictac-count]");
        const rpsCount = this.dashboard.querySelector("[data-rps-count]");
        const todayGlobalCount = this.dashboard.querySelector("[data-today-global-count]");
        const todayPongCount = this.dashboard.querySelector("[data-today-pong-count]");
        const todayTictacCount = this.dashboard.querySelector("[data-today-tictac-count]");
        const todayRpsCount = this.dashboard.querySelector("[data-today-rps-count]");

        if (globalCount)
            globalCount.textContent = this.statsData?.total["global"];
        if (pongCount)
            pongCount.textContent = this.statsData?.total['ping-pong'];
        if (tictacCount)
            tictacCount.textContent = this.statsData?.total['tic-tac-toe'];
        if (rpsCount)
            rpsCount.textContent = this.statsData?.total['rock-paper'];

        if (todayGlobalCount)
            todayGlobalCount.textContent = this.statsData?.today["global"];
        if (todayPongCount)
            todayPongCount.textContent = this.statsData?.today['ping-pong'];
        if (todayTictacCount)
            todayTictacCount.textContent = this.statsData?.today['tic-tac-toe'];
        if (todayRpsCount)
            todayRpsCount.textContent = this.statsData?.today['rock-paper'];
    }

    private updateProjection(): void {
        this.projection.setCategories = this.statsData?.projections.dates;
        this.projection.setDataSet = [{name: "Games Played", data: this.statsData?.projections.values}];
        this.projection.render();
    }

    private updateLeaderBoard(): void {
        const list = this.dashboard.querySelector('#website-leaderboard .activity-list');

        if (!list)
            return;

        list.innerHTML = "";

        this.statsData?.leaderBoard.forEach((player, index: number) => {
            const listElem = document.createElement("li");
            const link = document.createElement("a");
            const rank = document.createElement("span");
            const userimg = document.createElement("img");
            const username = document.createElement("strong");

            listElem.className = "leaderboard";
            rank.className = "card-icon";
            userimg.alt = "profile picture";

            link.href = `/profile?id=${player.userId}`;
            rank.textContent = `#${index + 1}`;
            userimg.src = this.pictureAPI + player.userId;
            username.textContent = player.username;

            link.appendChild(rank);
            link.appendChild(userimg);
            link.appendChild(username);
            listElem.appendChild(link);

            list.appendChild(listElem);
        });
    }

    private updateActivities(): void {
        const activities = this.dashboard.querySelector('#website-activity .activity-list');

        if (!activities)
            return;

        activities.innerHTML = "";

        this.statsData?.history.forEach(record => {
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

            text.innerHTML = `<strong>${record.winner_username} (${record.winner_nickname})</strong> emerged victorious over <strong>${record.loser_username} (${record.loser_nickname})</strong>.`;
            time.textContent = record.date;

            listElem.appendChild(icon);
            listElem.appendChild(text);
            listElem.appendChild(time);

            activities.appendChild(listElem);
        });
    }

    public async load(): httpPromise {
        return this.fetchStats().then(result => {
            this.updateStatsCards();
            this.updateProjection();
            this.updateLeaderBoard();
            this.updateActivities();
            return result;
        }).catch(error => {throw error});
    }
}

export default DashboardLoader;