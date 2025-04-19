import NavigationHandler from "./browserModule";

type Theme = "light" | "dark";

function broadcastEvent(eventName: string, eventPayload: any) {
    const event = new CustomEvent(eventName, {detail: eventPayload});
    document.dispatchEvent(event);
}

class ThemeManager {
    private theme: Theme;
    private themeButton: HTMLElement;

    constructor(themeButtonID = "mode-toggle") {
        const elem = document.getElementById(themeButtonID);

        if (elem) {
            this.themeButton = elem;
            this.themeButton.onclick = () => this.toggleTheme();
        }
        
        this.setTheme = this.getCachedTheme();
    }

    private getSystemTheme(): Theme {
        const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        return systemTheme ? "dark" : "light";
    }

    private getCachedTheme(): Theme {
        const cachedTheme = localStorage.getItem("theme");

        if (cachedTheme === "light" || cachedTheme === "dark")
            return (cachedTheme);
        
        const systemTheme = this.getSystemTheme();

        localStorage.setItem("theme", systemTheme);
        return (systemTheme);
    }

    private updateThemeButton(): void {
        if (!this.themeButton) return;
        
        if (this.theme === "light")
            this.themeButton.innerHTML = "<i class='bx bx-moon'></i>";
        else
        this.themeButton.innerHTML = "<i class='bx bx-sun'></i>";
    }

    private updateWebSite(): void {
        this.updateThemeButton();
        document.documentElement.setAttribute('data-theme', this.theme);
        broadcastEvent("themeChanged", this.theme);
    }

    public set setTheme(newTheme: Theme) {
        localStorage.setItem("theme", newTheme);
        this.theme = newTheme;
        this.updateWebSite();
    }

    public get currentTheme(): Theme {
        return (this.theme);
    }

    public toggleTheme(): Theme {
        this.setTheme = (this.theme === "light") ? "dark" : "light";
        return(this.theme);
    }
}

class NavBarHandler {
    private logoutAPI    : string;
    private navigation   : NavigationHandler;

    private sideNavElem  : HTMLElement | null;    
    private sideNavButton: HTMLElement | null;
    private screenButton : HTMLElement | null;
    private logoutButton : HTMLElement | null;

    constructor(baseAPI: string, navigationModule: NavigationHandler) {
        new ThemeManager();
        this.logoutAPI = `${baseAPI}/logout`;
        this.navigation = navigationModule;

        this.sideNavElem = document.getElementById("side-nav");
        this.sideNavButton = document.getElementById("toggle-side-nav");
        this.screenButton = document.getElementById("toggle-fullscreen");
        this.logoutButton = document.getElementById("logout");

        this.initialize();
    }

    private initialize(): void {
        if (this.sideNavElem && this.sideNavButton)
            this.sideNavButton.onclick = () => this.toggleSideNav();

        if (this.screenButton)
            this.screenButton.onclick = () => this.toggleFullScreen();

        if (this.logoutButton)
            this.logoutButton.onclick = () => this.logoutSession();

        document.addEventListener('fullscreenchange', () => this.updateScreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateScreenButton());
        document.addEventListener('msfullscreenchange', () => this.updateScreenButton());
    }

    private updateScreenButton() {
        if (!this.screenButton) return;

        if (document.fullscreenElement)
            this.screenButton.innerHTML = "<i class='bx bx-exit-fullscreen'></i>";
        else
            this.screenButton.innerHTML = "<i class='bx bx-fullscreen'></i>";
    }

    public async toggleFullScreen() {
        if (!this.screenButton) return;

        try {
            if (!document.fullscreenElement)
                await document.documentElement.requestFullscreen();
            else
                await document.exitFullscreen();
            this.updateScreenButton();
        }
        catch (error) {
            console.error("FullScreen Failed: ", error);
        }
    }

    public toggleSideNav() {
        if (!this.sideNavElem) return;

        if (this.sideNavElem.style.width === "0px") {
            this.sideNavElem.classList.remove("hidden");
            setTimeout(() => {this.sideNavElem!.style.width = "var(--side-nav-width)"}, 10);
        } else {
            this.sideNavElem.style.width = "0px";
            setTimeout(() => {this.sideNavElem!.classList.add("hidden")}, 500);
        }
    }

    public async logoutSession() {
        await fetch(this.logoutAPI, { method: "GET", credentials: "include" });
        this.navigation.navigateTo("/login");
    }
}

export default NavBarHandler;