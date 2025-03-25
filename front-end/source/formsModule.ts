class FormHandler {
    private domElement: HTMLFormElement;
    private targetAPI: string;
    private targetMethod: string;
    private successAction: (response: Record<string, any>) => void;
    private showStatus: boolean = true;

    constructor(formId: string, method: string, api: string, successAction?: (response: Record<string, any>) => void) {
        const formElement = document.getElementById(formId);

        if (!formElement)
            throw new Error(`Couldn't locate the form element.`);

        if (formElement.tagName !== "FORM")
            throw new Error(`The provided ID "${formId}" does not correspond to a <form> element.`);
        
        this.domElement = formElement as HTMLFormElement;
        this.targetMethod = method.toUpperCase();
        this.targetAPI = api;
        this.successAction = successAction || (data => console.log(data));

        this.init();
    }

    private getEntries(): string {
        const formData = new FormData(this.domElement);
        const entries = Object.fromEntries(formData.entries());

        return (JSON.stringify(entries));
    }

    private async establishLink(payload: string): Promise<string> {
        const response = await fetch(this.targetAPI, {
            method: this.targetMethod,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: payload
        })
        .catch(error => {throw new Error("Unknown error occurred")});

        const responseData = await response.text();
        if (!response.ok)
            throw new Error(`${responseData.length ? JSON.parse(responseData).error : "Unknown error occurred"}`);

        return (responseData);
    }

    private handleForm(event: SubmitEvent): void {
        event.preventDefault();

        this.statusReset();

        this.establishLink(this.getEntries())

        .then(response => {
            const responseObj = response.length ? JSON.parse(response) : {};

            this.statusSuccess(responseObj.message || "");
            this.successAction(responseObj)
        })

        .catch(error => this.statusFailure(error.message));
    }

    public statusSuccess(message: string): void
    {
        console.log(`Status: ${message}`);

        const formStatus = this.domElement.querySelector(".auth-status") as HTMLElement;

        if (!formStatus || !this.showStatus)
            return ;

        formStatus.innerHTML = message;
        formStatus.classList.remove("failure");
        formStatus.classList.add("success");
    }

    public statusFailure(message: string): void
    {
        console.error(`Status: ${message}`);

        const formStatus = this.domElement.querySelector(".auth-status") as HTMLElement;

        if (!formStatus || !this.showStatus)
            return ;

        formStatus.innerHTML = "Error - ".concat(message);
        formStatus.classList.remove("success");
        formStatus.classList.add("failure");
    }

    public statusReset(): void
    {
        const formStatus = this.domElement.querySelector(".auth-status") as HTMLElement;

        if (!formStatus)
            return ;

        formStatus.innerHTML = "";
        formStatus.classList.remove("success");
        formStatus.classList.remove("failure");
    }

    public statusEnable(): void {
        this.showStatus = true;
    }

    public statusDisable(): void {
        this.showStatus = false;
    }

    public get status(): boolean {
        return (this.showStatus);
    }

    private init(): void {
        this.domElement.addEventListener("submit", this.handleForm.bind(this));
    }
}

export default FormHandler;