interface sectionData {
    section: HTMLElement,
    load: () => Promise<number>
}

interface sectionsList {
    [key: string]: sectionData
}

class navigationHandler {
    private authSections: sectionsList = {};
    private dashSections: sectionsList = {};
    private mainNavElem: HTMLElement | null;
    private secondaryNavElem: HTMLElement | null;
    private errorElem: HTMLElement | null;
    private anchorLinks: HTMLAnchorElement[] = [];

    constructor () {
        this.anchorLinks = [...document.querySelectorAll("a")];
    }

    public addAuthSection(
        sectionPath: string,
        sectionId: string,
        loadFunction: () => Promise<number> = async () => Promise.resolve(200)
    ): void {
        const sectionElem = document.getElementById(sectionId);
        sectionPath = sectionPath.startsWith("/") ? sectionPath : `/${sectionPath}`;
        
        if (sectionElem)
            this.authSections[sectionPath] = {section: sectionElem, load: loadFunction};
    }

    public addDashSection(
        sectionPath: string,
        sectionId: string,
        loadFunction: () => Promise<number> = async () => Promise.resolve(200)
    ): void {
        const sectionElem = document.getElementById(sectionId);
        sectionPath = sectionPath.startsWith("/") ? sectionPath : `/${sectionPath}`;

        if (sectionElem)
            this.dashSections[sectionPath] = {section: sectionElem, load: loadFunction};
    }

    public setMainNavigation(navId: string): void {
        this.mainNavElem = document.getElementById(navId);
    }

    public setSecondaryNavigation(navId: string): void {
        this.secondaryNavElem = document.getElementById(navId);
    }

    public setErrorsection(sectionId: string): void {
        this.errorElem = document.getElementById(sectionId);
    }

    private showNavigation(): void {
        this.mainNavElem?.classList.remove("hidden");
    }

    private hideNavigation(): void {
        this.mainNavElem?.classList.add("hidden");
        this.secondaryNavElem?.classList.add("hidden");
    }

    private showErrorPage(code: number = 404, title: string = "page not found"): void {
        const errorCodeElem = this.errorElem?.querySelector("#error-code");
        const errorTitleElem = this.errorElem?.querySelector("#error-title");

        if (errorCodeElem)
            errorCodeElem.textContent = code.toString();
        if (errorTitleElem)
            errorTitleElem.textContent = title;

        this.errorElem?.classList.remove("hidden");
    }

    private hideErrorPage(): void {
        this.errorElem?.classList.add("hidden");
    }

    private hideAllSections(): void {
        const authkeys = Object.keys(this.authSections);
        const dashKeys = Object.keys(this.dashSections);

        for (const key of authkeys)
            this.authSections[key].section.classList.add("hidden");

        for (const key of dashKeys)
            this.dashSections[key].section.classList.add("hidden");

        this.hideNavigation();
        this.hideErrorPage();
    }

    private showSection(sectionPath: string, isUserLoggedIn: boolean): void {
        const sections = isUserLoggedIn? this.dashSections : this.authSections;
        const sectionData = sections[sectionPath];

        if (isUserLoggedIn)
            this.showNavigation();
        else
            this.hideNavigation();

        if (!sectionData){
            this.showErrorPage();
            return ;
        }

        sections[sectionPath].load()
        .then(_ => {
            sectionData.section.classList.remove("hidden");
        })
        .catch(error => {
            if (error === 401) {
                //clear the userdata object
                this.redirect("/");
            }
            else
                this.showErrorPage(error);
        })
    }

    private pushToHistory(sectionPath: string): void {
        sectionPath = sectionPath.startsWith("/") ? sectionPath : `/${sectionPath}`;

        if (location.pathname !== sectionPath)
            window.history.pushState({}, "", sectionPath);
    }

    public redirect(pathName: string) {
        //Replace with a method that uses the userdata class to check if the user is logged in
        const isUserLoggedIn = false;
        pathName = pathName.startsWith("/") ? pathName : `/${pathName}`;

        this.pushToHistory(pathName);
        this.hideAllSections();
        this.showSection(pathName, isUserLoggedIn);
    }

    private handleEvents(event: MouseEvent): void {
        const targetAnchor = event.currentTarget as HTMLAnchorElement;
        const targetPath = targetAnchor.getAttribute("href");

        event.preventDefault();
        if (targetPath)
            this.redirect(targetPath);
    }

    public init(): void {
        this.hideAllSections();
        this.hideNavigation();
        this.hideErrorPage();

        this.anchorLinks.forEach(link => {
            link.addEventListener("click", this.handleEvents.bind(this));
            window.addEventListener("popstate", _ => this.redirect(location.pathname));
            document.addEventListener("DOMContentLoaded", _ => this.redirect(location.pathname));
        });
        this.redirect("/");
    }
}

export default navigationHandler;