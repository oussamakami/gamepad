interface sectionData {
    id: string,
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
        if(!sectionPath.startsWith("/"))
            sectionPath = "/" + sectionPath;

        this.authSections[sectionPath] = {id: sectionId, load: loadFunction};
    }

    public addDashSection(
        sectionPath: string,
        sectionId: string,
        loadFunction: () => Promise<number> = async () => Promise.resolve(200)
    ): void {
        if(!sectionPath.startsWith("/"))
            sectionPath = "/" + sectionPath;

        this.dashSections[sectionPath] = {id: sectionId, load: loadFunction};
    }

    public setMainNavigation(navId: string): void {
        this.mainNavElem = document.getElementById(navId);
    }

    public setSecondayNavigation(navId: string): void {
        this.secondaryNavElem = document.getElementById(navId);
    }

    public setErrorsection(sectionId: string): void {
        this.errorElem = document.getElementById(sectionId);
    }

    public showNavigation(): void {
        this.mainNavElem?.classList.remove("hidden");
    }

    public hideNavigation(): void {
        this.mainNavElem?.classList.add("hidden");
        this.secondaryNavElem?.classList.add("hidden");
    }

    public showErrorPage(code: number = 404, title: string = "page not found"): void {
        const errorCodeElem = this.errorElem?.querySelector("#error-code");
        const errorTitleElem = this.errorElem?.querySelector("#error-title");

        if (errorCodeElem)
            errorCodeElem.textContent = code.toString();
        if (errorTitleElem)
            errorTitleElem.textContent = title;

        this.errorElem?.classList.remove("hidden");
    }

    public hideErrorPage(): void {
        this.errorElem?.classList.add("hidden");
    }
}

export default navigationHandler;