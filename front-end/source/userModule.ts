type Theme = "light" | "dark";

class UserData {
    private userId: number = 0;
    private userName: string = "";
    private userEmail: string = "";
    private webTheme: Theme;

    constructor(data?: Record<string, any>) {
        this.webTheme = this.extractTheme();

        if (data)
            this.updateData(data);
    }

    private extractTheme(): Theme {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "light" || storedTheme === "dark")
            return storedTheme;
        localStorage.setItem("theme", "light");
        return "light";
    }

    public updateData(data: Record<string, any>): void {
        this.userId = data.id ?? 0;
        this.userName = data.username ?? "";
        this.userEmail = data.email ?? "";
        
        if (data.id)
            localStorage.setItem("userID", data.id.toString());
        else
            localStorage.removeItem("userID");
    }

    public updateTheme(newTheme: Theme) {
        localStorage.setItem("theme", newTheme);
        this.webTheme = newTheme;
    }

    public get id(): number {
        return (this.userId);
    }
    
    public get name(): string {
        return (this.userName);
    }

    public get email(): string {
        return (this.userEmail);
    }

    public get theme(): "light" | "dark" {
        return (this.webTheme);
    }

}

export default UserData;
