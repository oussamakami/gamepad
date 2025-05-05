import {httpPromise} from "./browserModule";
import ActionsHandler from "./actionsModule";

class SearchLoader {
    private pageNumber: number;
    private readonly elemPerPage = 12;

    //APIS
    private readonly searchAPI     : string;
    private readonly pictureAPI    : string;

    //DOM ELEMENTS
    private readonly searchPage    : HTMLElement;
    private readonly searchPageBody: HTMLElement;
    private readonly nextPageButton: HTMLElement | null;
    private readonly PrevPageButton: HTMLElement | null;

    //MODULES
    private readonly btnGenerator  : ActionsHandler;

    private searchData: Record<string, any> | undefined;

    constructor(baseAPI: string) {
        const elem = document.getElementById("search");
        const searchBodyelem = elem?.querySelector("ul");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, 1) : baseAPI;

        this.searchAPI = baseAPI + "/search";
        this.pictureAPI = baseAPI + "/picture";

        if (!elem || !searchBodyelem)
            throw new Error("Search Section not found");

        this.searchPage = elem;
        this.searchPageBody = searchBodyelem;
        this.nextPageButton = this.searchPage.querySelector("#search-next");
        this.PrevPageButton = this.searchPage.querySelector("#search-prev");

        this.btnGenerator = new ActionsHandler(baseAPI);

        this.PrevPageButton && (this.PrevPageButton.onclick = () => {
            if (this.pageNumber === 1)
                return ;

            this.pageNumber--;
            this.updatePageBody();
        });
        this.nextPageButton && (this.nextPageButton.onclick = () => {
            let start = ((this.pageNumber) * this.elemPerPage);

            if (start > (this.searchData?.length || 0))
                return ;

            this.pageNumber++;
            this.updatePageBody();
        });
    }

    private async fetchStats(): httpPromise {
        const url = new URLSearchParams(location.search);
        const search = url.get("query");
        const endpoint = `${this.searchAPI}/${search}`;

        try{
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include"  
            });
            
            if (!response.ok)
                throw response;
            
            this.pageNumber = 1;
            this.searchData = (await response.json());

            return {httpCode: response.status, httpName: response.statusText};
        }
        catch (error) {
            throw {httpCode: error.status, httpName: error.statusText};
        }
    }

    private generateCountInfo(): void {
        if (!this.searchData) return;

        const countElem = document.createElement("h5");

        countElem.id = "results-count";
        countElem.innerHTML = `found <span>${this.searchData.length}</span> results`;
        this.searchPageBody.innerHTML = "";
        this.searchPageBody.appendChild(countElem);
    }

    private createItem(userid, username, friendship, onlineStatus = false): HTMLElement {
        const item = document.createElement('li');
        const statusIcon = onlineStatus ? '<i class="user-online"></i>' : '<i class="user-offline"></i>';
        
        item.className = "user-card";
        item.innerHTML = `
            <div class="card-title">
                <img alt="profile picture" src="${this.pictureAPI}/${userid}?v=${Date.now()}">
                <h4><p class="user-status">${statusIcon}</p><strong>${username}</strong></h4>
            </div>
        `;

        item.appendChild(this.btnGenerator.generateBtnContainer(userid, friendship, true));
        return (item);
    }

    private updatePageBody(): void {
        if (!this.searchData) return;

        let start = (this.pageNumber - 1) * this.elemPerPage;
        let end   = Math.min(this.searchData.length, start + this.elemPerPage);
        const fragment = document.createDocumentFragment();

        this.generateCountInfo();

        while (start < end) {
            let userid = this.searchData.data[start].id;
            let username = this.searchData.data[start].username;
            let friendship = this.searchData.data[start].friendship;
            let isOnline = this.searchData.data[start].isOnline;

            fragment.appendChild(this.createItem(userid, username, friendship, isOnline));
            start++;
        }

        this.searchPageBody.appendChild(fragment);
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

export default SearchLoader;