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
    constructor (){}

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

        if (!sectionData){
            this.showErrorPage();
            return ;
        }

        sections[sectionPath].load()
        .then(() => {
            sectionData.section.classList.remove("hidden");
        })
        .catch(error => {
            this.showErrorPage(error);
        })
    }

    private pushToHistory(sectionPath: string): void {
        sectionPath = sectionPath.startsWith("/") ? sectionPath : `/${sectionPath}`;

        if (location.pathname !== sectionPath)
            window.history.pushState({}, "", sectionPath);
    }
}

export default navigationHandler;