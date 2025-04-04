class FormHandler {
    private formElement: HTMLFormElement;
    private targetAPI: string;
    private targetMethod: string;
    private onSuccess: (response: Record<string, any>) => void;
    private showStatus: boolean = true;

    constructor(
        formId: string,
        method: string,
        api: string,
        onSuccess?: (response: Record<string, any>) => void
    ) {
        const element = document.getElementById(formId);

        if (!element)
            throw new Error(`Form element with ID "${formId}" not found`);

        if (element.tagName !== "FORM")
            throw new Error(`Element with ID "${formId}" is not a form`);
        
        this.formElement = element as HTMLFormElement;
        this.targetMethod = method.toUpperCase();
        this.targetAPI = api;
        this.onSuccess = onSuccess || (data => {});

        this.initialize();
    }

    private initialize(): void {
        this.formElement.addEventListener("submit", this.handleSubmit.bind(this));
    }

    private getEntries(): string {
        const formData = new FormData(this.formElement);
        const entries = Object.fromEntries(formData.entries());

        return (JSON.stringify(entries));
    }

    public addToPayload(key: string, value: string): void {
        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value;

        this.formElement.appendChild(input);
    }

    public resetPasswordFields(): void {
        const passwordInputs = this.formElement.querySelectorAll<HTMLInputElement>('input[type="password"]');
        
        passwordInputs.forEach(input => input.value = "");
    }

    private async sendRequest(payload: string): Promise<string> {
        const response = await fetch(this.targetAPI, {
            method: this.targetMethod,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: payload
        })
        .catch(error => {throw new Error("Unknown error occurred")});

        const responseData = await response.text();
        if (!response.ok)
            throw new Error(responseData.length ? JSON.parse(responseData).error : "Unknown error occurred");

        return (responseData);
    }

    private handleSubmit(event: SubmitEvent): void {
        event.preventDefault();
        this.resetStatus();


        this.sendRequest(this.getEntries())
        .then(response => {
            const responseObj = response.length ? JSON.parse(response) : {};

            this.showSuccess(responseObj.message || "Success");
            this.onSuccess(responseObj)
        })
        .catch(error => this.showError(error.message));
    }

    public showSuccess(message: string): void
    {
        this.updateStatus(message, "success");
    }

    public showError(message: string): void
    {
        this.updateStatus(message, "failure");
    }

    public resetStatus(): void
    {
        this.updateStatus("");
    }

    private updateStatus(message: string, type?: "success" | "failure"): void {
        const statusElement = this.formElement.querySelector(".form-status") as HTMLElement;

        if (!this.showStatus || !statusElement) return ;
        
        statusElement.textContent = message;
        statusElement.className = "form-status";
        if (type) statusElement.classList.add(type);
    }

    public set setStatusVisibility(visible: boolean) {
        this.showStatus = visible;
    }

    public get statusVisibility(): boolean {
        return (this.showStatus);
    }
}

export default FormHandler;