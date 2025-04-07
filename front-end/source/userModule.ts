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

    constructor(sessionDataAPI: string, pictureAPI: string) {
        this.clear();
        this.sessionAPI = sessionDataAPI;
        this.pictureAPI = pictureAPI.endsWith("/") ? pictureAPI : pictureAPI + "/";
        this.theme = this.getCachedTheme();
        this.isSessionLoaded = false;
    }

    private getCachedTheme(): Theme {
        const cachedTheme = localStorage.getItem("theme");

        if (cachedTheme === "light" || cachedTheme === "dark")
            return cachedTheme;

        localStorage.setItem("theme", "light");
        return "light";
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

    public async isAuthenticated(): Promise<boolean> {
        if ((!this.isLoggedIn && !this.isSessionLoaded) || this.isLoggedIn)
            await this.fetchSessionData();
        return (this.isLoggedIn);
    }
}

export default UserData;