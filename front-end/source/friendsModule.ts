import {httpPromise} from "./browserModule";
import ActionsHandler from "./actionsModule";

class FriendsLoader {
    private pageNumber: number;
    private readonly elemPerPage = 12;

    //APIS
    private readonly friendsAPI     : string;
    private readonly pictureAPI     : string;

    //DOM ELEMENTS
    private readonly friendsPage    : HTMLElement;
    private readonly friendsPageBody: HTMLElement;
    private readonly nextPageButton : HTMLElement | null;
    private readonly PrevPageButton : HTMLElement | null;

    //MODULES
    private readonly btnGenerator  : ActionsHandler;

    private friendsData: Record<string, any> | undefined;

    constructor(baseAPI: string) {
        const elem = document.getElementById("friends");
        const searchBodyelem = elem?.querySelector("ul");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.friendsAPI = baseAPI + "/friends";
        this.pictureAPI = baseAPI + "/picture";

        if (!elem || !searchBodyelem)
            throw new Error("Search Section not found");

        this.friendsPage = elem;
        this.friendsPageBody = searchBodyelem;
        this.nextPageButton = this.friendsPage.querySelector("#friends-next");
        this.PrevPageButton = this.friendsPage.querySelector("#friends-prev");

        this.btnGenerator = new ActionsHandler(baseAPI);

        this.PrevPageButton && (this.PrevPageButton.onclick = () => {
            if (this.pageNumber === 1)
                return ;

            this.pageNumber--;
            this.updatePageBody();
        });
        this.nextPageButton && (this.nextPageButton.onclick = () => {
            let start = ((this.pageNumber) * this.elemPerPage);

            if (start > (this.friendsData?.length || 0))
                return ;

            this.pageNumber++;
            this.updatePageBody();
        });
    }

    private async fetchStats(): httpPromise {
        const endpoint = this.friendsAPI;

        try{
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok)
                throw response;
            
            this.pageNumber = 1;
            this.friendsData = (await response.json());

            return {httpCode: response.status, httpName: response.statusText};
        }
        catch (error) {
            throw {httpCode: error.status, httpName: error.statusText};
        }
    }

    private generateCountInfo(): void {
        if (!this.friendsData) return;

        const countElem = document.createElement("h5");

        countElem.id = "results-count";
        countElem.innerHTML = `found <span>${this.friendsData.length}</span> results`;
        this.friendsPageBody.innerHTML = "";
        this.friendsPageBody.appendChild(countElem);
    }

    private createItem(userid, username, friendship, onlineStatus = false): HTMLElement {
        const item = document.createElement('li');
        const statusIcon = onlineStatus ? '<i class="user-online"></i>' : '<i class="user-offline"></i>';
        
        item.className = "user-card";
        item.innerHTML = `
            <div class="card-title">
                <img alt="profile picture" src="${this.pictureAPI}/${userid}">
                <h4><p class="user-status">${statusIcon}</p><strong>${username}</strong></h4>
            </div>
        `;

        item.appendChild(this.btnGenerator.generateBtnContainer(userid, friendship, true));
        return (item);
    }

    private updatePageBody(): void {
        if (!this.friendsData) return;

        let start = (this.pageNumber - 1) * this.elemPerPage;
        let end   = Math.min(this.friendsData.length, start + this.elemPerPage);
        const fragment = document.createDocumentFragment();

        this.generateCountInfo();

        while (start < end) {
            let userid = this.friendsData.data[start].id;
            let username = this.friendsData.data[start].username;
            let friendship = this.friendsData.data[start].friendship;
            let isOnline = this.friendsData.data[start].isOnline;

            fragment.appendChild(this.createItem(userid, username, friendship, isOnline));
            start++;
        }

        this.friendsPageBody.appendChild(fragment);
    }

    public async load(): httpPromise {
        return this.fetchStats()
        .then(result => {
            this.updatePageBody();

            return (result);
        })
        .catch(error => {
            throw (error)
        });
    }
}

export default FriendsLoader;