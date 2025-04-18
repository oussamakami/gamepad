type Theme = "light" | "dark";

class UserData {
    private id: number;
    private name: string;
    private email: string;
    private theme: Theme;
    private sessionAPI: string;
    private pictureAPI: string
    private isLoggedIn: boolean;
    private isSessionLoaded: boolean;
    private themeButton: HTMLElement | null;

    constructor(baseAPI: string) {
        if (baseAPI.endsWith("/"))
            baseAPI = baseAPI.slice(0, -1);

        this.clear();
        this.sessionAPI = baseAPI + "/sessionData";
        this.pictureAPI = baseAPI + "/picture/";
        this.theme = this.getCachedTheme();
        this.isSessionLoaded = false;
        // this.themeButton = document.getElementById(themeToggleButtonID);

        // this.themeButton?.addEventListener("click", (e) => {
        //     this.setTheme = this.theme === "light" ? "dark" : "light";
        // });

        this.updateBrowserTheme();
    }

    private getSystemTheme(): Theme {
        const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        return systemTheme ? "dark" : "light";
    }

    private getCachedTheme(): Theme {
        const cachedTheme = localStorage.getItem("theme");

        if (cachedTheme === "light" || cachedTheme === "dark")
            return cachedTheme;
        
        const systemTheme = this.getSystemTheme();

        localStorage.setItem("theme", systemTheme);
        return systemTheme;
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
            picture.src = this.pictureAPI + this.id;
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

    public set setTheme(newTheme: Theme) {
        localStorage.setItem("theme", newTheme);
        this.theme = newTheme;
        this.updateBrowserTheme();
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

    public get currentTheme(): "light" | "dark" {
        return (this.theme);
    }

    private broadcastEvent(eventName: string, eventPayload: any) {
        eventName = "user: " + eventName;
        const event = new CustomEvent(eventName, {detail: eventPayload});
        document.dispatchEvent(event);
    }

    private updateBrowserTheme() {
        if (this.themeButton) {
            if (this.theme === "light")
                this.themeButton.innerHTML = "<i class='bx bx-moon'></i>";
            else
            this.themeButton.innerHTML = "<i class='bx bx-sun'></i>";
        }

        document.documentElement.setAttribute('data-theme', this.theme);
        this.broadcastEvent("themeChanged", this.theme);
    }

    public async isAuthenticated(): Promise<boolean> {
        if ((!this.isLoggedIn && !this.isSessionLoaded) || this.isLoggedIn)
            await this.fetchSessionData();
        return (this.isLoggedIn);
    }
}

export default UserData;