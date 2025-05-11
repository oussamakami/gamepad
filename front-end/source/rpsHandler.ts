type RPSChoice = 0 | 1 | 2;

interface playerData {
    nickname: string,
    choice: RPSChoice | -1
}

class RPSHandler {
    private readonly possibleChoices = ["✊", "✋", "✌️"];

    //DOM ELEMENTS
    private RPSPage        : HTMLElement;
    private player1Status  : HTMLElement;
    private player2Status  : HTMLElement;
    private player1Choices : HTMLElement;
    private player2Choices : HTMLElement;
    private resultDisplay  : HTMLElement;

    //RPS DATA
    private player1        : playerData;
    private player2        : playerData;

    //Resolve Promise
    private gameWinner?: (winner: number) => void;

    constructor(sectionId: string) {
        const section        = document.getElementById(sectionId);
        const player1Status  = section?.querySelector("#player1-status");
        const player2Status  = section?.querySelector("#player2-status");
        const player1Choices = section?.querySelector("#player1-choices");
        const player2Choices = section?.querySelector("#player2-choices");
        const resultDisplay  = section?.querySelector("#rps-result");

        if (!section || !player1Status || !player2Status ||
            !player1Choices || !player2Choices || !resultDisplay)
            throw new Error("RPS section not found");

        this.RPSPage        = section;
        this.player1Status  = player1Status as HTMLElement
        this.player2Status  = player2Status as HTMLElement;
        this.player1Choices = player1Choices as HTMLElement;
        this.player2Choices = player2Choices as HTMLElement;
        this.resultDisplay  = resultDisplay as HTMLElement;
        this.resetPageData();
    }

    private resetPageData(): void {
        this.player1 = {nickname: "player1", choice: -1};
        this.player2 = {nickname: "player2", choice: -1};

        this.player1Status.textContent = "Waiting...";
        this.player2Status.textContent = "Waiting...";

        this.player1Choices.innerHTML = "";
        this.player2Choices.innerHTML = "";
    
        this.RPSPage.className = "hidden";
        this.resultDisplay.className = "hidden";
    }

    private lockPlayerChoice(playerNumber: 1 | 2): void {
        const status  = this[`player${playerNumber}Status`];
        const choices = this[`player${playerNumber}Choices`];

        if (!status || !choices) return;

        status.textContent = "locked";
        choices.querySelectorAll("button").forEach(btn => btn.onclick = ()=>{});
    }

    private setPlayerChoice(playerNumber: 1 | 2, choice: RPSChoice): void {
        const player = this[`player${playerNumber}`];

        if (!player || player.choice != -1 || (choice > 2 && choice < 0))
            return;

        player.choice = choice;
        this.lockPlayerChoice(playerNumber);
        this.determineWinner();
    }

    private generateButtons(playerNumber: 1 | 2): DocumentFragment {
        const fragment = document.createDocumentFragment();

        this.possibleChoices.forEach((choice, index) => {
            const btn = document.createElement("button");

            btn.className = "btn";
            btn.innerHTML = choice;
            btn.onclick = () => this.setPlayerChoice(playerNumber, index as RPSChoice);
            fragment.appendChild(btn);
        });

        return (fragment);
    }
    private generatePlayersButtons(): void {
        this.player1Choices.appendChild(this.generateButtons(1));
        this.player2Choices.appendChild(this.generateButtons(2));
    }

    private showResult(winner: 0 | 1 | 2) {
        let message = "Draw";

        if (winner === 1)
            message = `${this.player1.nickname} Wins`;
        else if (winner === 2)
            message = `${this.player2.nickname} Wins`;

        this.resultDisplay.textContent = message;
        this.resultDisplay.className = ""
    }

    private determineWinner(): void {
        let result;
        if (this.player1.choice === -1 || this.player2.choice === -1) return;

        this.player1Status.textContent = this.possibleChoices[this.player1.choice];
        this.player2Status.textContent = this.possibleChoices[this.player2.choice];

        if (this.player1.choice === this.player2.choice)
            result = 0;
        else if ((this.player1.choice === 0 && this.player2.choice === 2) ||
            (this.player1.choice === 1 && this.player2.choice === 0) ||
            (this.player1.choice === 2 && this.player2.choice === 1))
            result = 1;
        else
            result = 2;

        this.showResult(result as 0 | 1 | 2);

        setTimeout(() => {
            this.resetPageData();
            if (this.gameWinner) {
                this.gameWinner(result);
                this.gameWinner = undefined;
            }
        }, 1000);
    }

    public async startGame(player1Name: string, player2Name: string) {
        return new Promise<number>((resolve) => {
            this.gameWinner = resolve;
            this.resetPageData();
            this.generatePlayersButtons();

            this.player1.nickname = player1Name;
            this.player2.nickname = player2Name;
            
            this.RPSPage.className = "";
        });
    }

    public destroyGame() {
        this.resetPageData();
        if (this.gameWinner) {
            this.gameWinner(0);
            this.gameWinner = undefined;
        }
    }
}

export default RPSHandler;