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

    constructor (){}

    public addAuthSection(
        sectionPath: string,
        sectionId: string,
        loadFunction: () => Promise<number> = async () => Promise.resolve(200)
    ) {
        if(!sectionPath.startsWith("/"))
            sectionPath = "/" + sectionPath;

        this.authSections[sectionPath] = {id: sectionId, load: loadFunction};
    }

    public addDashSection(
        sectionPath: string,
        sectionId: string,
        loadFunction: () => Promise<number> = async () => Promise.resolve(200)
    ) {
        if(!sectionPath.startsWith("/"))
            sectionPath = "/" + sectionPath;

        this.dashSections[sectionPath] = {id: sectionId, load: loadFunction};
    }
}

export default navigationHandler;