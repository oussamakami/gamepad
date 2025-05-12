import UserData from "./userModule"
import FormHandler from "./formsModule"

export type httpPromise = Promise<{httpCode: number, httpName: string}>

interface SectionOptions {
    formHander?: FormHandler,
    onload?: (formHander?: FormHandler) => httpPromise
}

interface Section {
    element: HTMLElement,
    options: SectionOptions
}

class NavigationHandler {
    private authSections: Map<string, Section> = new Map;
    private dashSections: Map<string, Section> = new Map;
    private mainNav?: HTMLElement;
    private sideNav?: HTMLElement;
    private errorPage?: HTMLElement;
    private user: UserData;

    constructor (USER: UserData) {
        this.user = USER;
    }

    public get userData(): UserData {
        return (this.user);
    }

    public configure(
        mainNavId?:string,
        sideNavId?: string,
        errorPageId?: string
    ): void {
        if (mainNavId)
            this.mainNav = document.getElementById(mainNavId) as HTMLElement | undefined;
        if (sideNavId)
            this.sideNav = document.getElementById(sideNavId) as HTMLElement | undefined;
        if (errorPageId)
            this.errorPage = document.getElementById(errorPageId) as HTMLElement | undefined;
    }

    private normalizePath(path: string): string {

        if (path.endsWith("/") && path.length > 1)
            path = path.slice(0, -1);

        if (!path.startsWith("/"))
            path = `/${path}`;

        return (path.split('?')[0].split('#')[0]);
    }

    public addAuthSection(
        path: string,
        sectionId: string,
        options: SectionOptions = {}
    ): void {
        const element = document.getElementById(sectionId);

        if (!element) return ;

        if (!options.onload)
            options.onload = () => Promise.resolve({httpCode: 200, httpName: "OK"});

        this.authSections.set(this.normalizePath(path), {element, options});
    }

    public addDashSection(
        path: string,
        sectionId: string,
        options: SectionOptions = {}
    ): void {
        const element = document.getElementById(sectionId);

        if (!element) return ;

        if (!options.onload)
            options.onload = () => Promise.resolve({httpCode: 200, httpName: "OK"});

        this.dashSections.set(this.normalizePath(path), {element, options});
    }

    private showError(code: number, title: string): void {
        if (!this.errorPage) return;

        const codeElement = this.errorPage.querySelector("#error-code");
        const titleElement = this.errorPage.querySelector("#error-title");

        if (codeElement)
            codeElement.textContent = code.toString();
        if (titleElement)
            titleElement.textContent = title;

        this.errorPage.classList.remove("hidden");
    }

    private hideError(): void {
        this.errorPage?.classList.add("hidden");
    }

    private highLightNavSection(sectionId?: string): void {
        if (!sectionId) return ;

        const navButtonId = "#" + sectionId + "-nav";
        const navButtons = this.sideNav?.querySelectorAll("li");

        navButtons?.forEach(button => button.classList.remove("active"));
        this.sideNav?.querySelector(navButtonId)?.classList.add("active");
    }

    private toggleNavigation(isAuthenticated: boolean, sectionId?: string): void {
        if (!isAuthenticated) {
            this.mainNav?.classList.add("hidden");
            this.sideNav?.classList.add("hidden");
        }
        else {
            if (this.mainNav?.classList.contains("hidden"))
                this.sideNav?.classList.remove("hidden");
            this.mainNav?.classList.remove("hidden");
            this.highLightNavSection(sectionId);
        }
    }

    private hideAllSections(isAuthenticated: boolean): void {
        const sections = [...this.authSections.values(), ...this.dashSections.values()]

        sections.forEach(section => section.element.classList.add("hidden"));

        this.hideError();
        this.toggleNavigation(isAuthenticated);
    }

    private async showSection(path: string): Promise<void> {
        const isLoggedIn = await this.user.isAuthenticated();
        const sections = isLoggedIn? this.dashSections : this.authSections;
        const section = sections.get(path);

        this.toggleNavigation(isLoggedIn, section?.element.id);

        if (!section) {
            this.hideAllSections(isLoggedIn);
            this.showError(404, "page not found");
            return ;
        }

        section.options.formHander?.resetPasswordFields();
        section.options.formHander?.resetStatus();
        section.options.onload!(section.options.formHander)
        .then(_ => {
            this.hideAllSections(isLoggedIn);
            section.element.classList.remove("hidden");
        })
        .catch(error => {
            if (error.httpCode === 401) {
                this.user.clear();
                this.navigateTo(`/login?error=${encodeURIComponent("session expired")}`);
            } else {
                this.hideAllSections(isLoggedIn);
                this.showError(error.httpCode, error.httpName);
            }
        })
    }

    private pushToHistory(path: string): void {
        if (location.pathname + location.search !== path)
            window.history.pushState({}, "", path);
    }

    public navigateTo(path: string): void {
        const location = this.normalizePath(path);

        this.pushToHistory(path);
        this.showSection(location);
    }

    public reloadPage(): void {
        this.navigateTo(location.pathname + location.search);
    }

    private handleEvents(event: MouseEvent): void {
        const targetAnchor = (event.target as HTMLElement).closest('a');
        const targetPath = (targetAnchor as HTMLAnchorElement)?.getAttribute("href");
        if (!targetAnchor) return ;
        
        event.preventDefault();

        if (targetPath)
            this.navigateTo(targetPath);
    }

    public initialize(): void {
        this.hideAllSections(false);

        document.addEventListener("click", this.handleEvents.bind(this));
        window.addEventListener("popstate", _ => this.reloadPage());
        window.addEventListener("DOMContentLoaded", _ => this.reloadPage());
    }
}

export default NavigationHandler;