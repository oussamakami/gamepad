class UserData {
    private id: number;
    private name: string;
    private email: string;
    private sessionAPI: string;
    private pictureAPI: string
    private isLoggedIn: boolean;
    private isSessionLoaded: boolean;

    constructor(baseAPI: string) {
        if (baseAPI.endsWith("/"))
            baseAPI = baseAPI.slice(0, -1);

        this.clear();
        this.sessionAPI = baseAPI + "/sessionData";
        this.pictureAPI = baseAPI + "/picture";
        this.isSessionLoaded = false;
    }

    public load(data: Record<string, any>): void {
        if (!data.id || !data.username || !data.email)
            return ;

        this.id = data.id;
        this.name = data.username;
        this.email = data.email;
        this.isLoggedIn = true;

        const picture = document.querySelector("[data-nav-user-img]") as HTMLImageElement;
        const displayname = document.querySelector("[data-nav-user-name]");

        if (picture)
            picture.src = `${this.pictureAPI}/${this.id}?v=${Date.now()}`;
        if (displayname)
            displayname.textContent = this.name;
    }

    public clear(): void {
        this.id = 0;
        this.name = "";
        this.email = "";
        this.isLoggedIn = false;
    }

    public async fetchSessionData(): Promise<void> {
        try {
            const response = await fetch(this.sessionAPI, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) throw new Error();

            this.load(await response.json());
        } catch {
            this.clear();
        }
        this.isSessionLoaded = true;
    }

    public get userId(): number {
        return (this.id);
    }
    
    public get userName(): string {
        return (this.name);
    }

    public get userEmail(): string {
        return (this.email);
    }

    public async isAuthenticated(): Promise<boolean> {
        if (!this.isSessionLoaded)
            await this.fetchSessionData();
        return (this.isLoggedIn);
    }
}

export default UserData;