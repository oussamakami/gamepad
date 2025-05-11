import { httpPromise } from "./browserModule";
import FormHandler from "./formsModule";
import SocketHandler from "./SocketModule";
import PongHandler from "./pongHandler";
import RPSHandler from "./rpsHandler";


type GameMode = "single" | "tournament";

enum GameType {
    Pong   = "ping-pong",
    RPS    = "rock-paper",
    TicTac = "tic-tac-toe"
}

const PAGE_TITLES = {
    [GameType.Pong]  : "<h4>Ping Pong</h4><i class='bx bx-meteor card-icon'></i>",
    [GameType.RPS]   : "<h4>Rock Paper Scissors</h4><i class='bx bx-cut card-icon'></i>",
    [GameType.TicTac]: "<h4>Tic Tac Toe</h4><i class='bx bx-circle card-icon'></i>"
};

const PATH_TO_GAME = {
    "/ping-pong" : GameType.Pong,
    "/rock-paper": GameType.RPS,
    "/tic-tac"   : GameType.TicTac
};

interface Player {
    user_id : number,
    nickname: string
}

interface Match {
    player1 : Player,
    player2 : Player,
    score1  : number,
    score2  : number
}

class GameHandler {
    //APIS
    private readonly gamesAPI       : string;

    //DOM ELEMENTS
    private readonly gamePage       : HTMLElement;
    private readonly pageTitle      : HTMLElement;
    private readonly modePage       : HTMLElement;
    private readonly setupPage      : HTMLElement;
    private readonly arenaPage      : HTMLElement;
    private readonly resultPage     : HTMLElement;
    private readonly tournamentBoard: HTMLElement;

    //FORMS
    private readonly setupForm      : FormHandler;

    //MODULES
    private readonly socket         : SocketHandler;

    //PAGE DATA
    private gameMode                : GameMode;
    private gameType?               : GameType;
    private matchIndex              : number;
    private matches                 : Match[];

    //GAMES
    private pong                    : PongHandler;
    private RPS                     : RPSHandler;

    constructor(baseAPI: string, socketHandler: SocketHandler) {
        const elem            = document.getElementById("match-maker");
        const pageTitle       = elem?.querySelector(".section-title");
        const modePage        = elem?.querySelector("#mode-selection");
        const setupPage       = elem?.querySelector("#player-setup");
        const arenaPage       = elem?.querySelector("#game-arena");
        const resultPage      = elem?.querySelector("#game-result");
        const tournamentBoard = elem?.querySelector("#tournament-bracket");

        if (!elem || !pageTitle || !modePage || !setupPage ||
            !arenaPage || !resultPage || !tournamentBoard)
            throw new Error("Games Section not found");

        baseAPI = baseAPI.endsWith("/") ? baseAPI.slice(0, -1) : baseAPI;

        this.gamesAPI = `${baseAPI}/verifyGameUsers`;

        this.gamePage        = elem;
        this.pageTitle       = pageTitle       as HTMLElement;
        this.modePage        = modePage        as HTMLElement;
        this.setupPage       = setupPage       as HTMLElement;
        this.arenaPage       = arenaPage       as HTMLElement;
        this.resultPage      = resultPage      as HTMLElement;
        this.tournamentBoard = tournamentBoard as HTMLElement;

        this.setupForm = new FormHandler("player-setup-form", this.gamesAPI, (data) => this.handleArenaPage(data));

        this.socket = socketHandler;
        this.pong = new PongHandler("ping-pong");
        this.RPS = new RPSHandler("rock-paper");
    }

    private hideAllPages(): void {
        this.modePage.classList.add("hidden");
        this.setupPage.classList.add("hidden");
        this.arenaPage.classList.add("hidden");
        this.resultPage.classList.add("hidden");
        this.tournamentBoard.classList.add("hidden");
    }

    private resetPageData(): void {
        this.hideAllPages();
        this.gameMode = "single";
        this.gameType = undefined;
        this.matchIndex = 0;
        this.matches = [];

        this.pong.destroyGame();
        this.RPS.destroyGame();
    }

    private determineGameType(): boolean {
        this.gameType = PATH_TO_GAME[location.pathname];

        if (!this.gameType) return (false);

        this.pageTitle.innerHTML = PAGE_TITLES[this.gameType];
        return (true);
    }

    private handleGameMode(): void {
        const singleModeBtn     = this.modePage.querySelector("#single-game-btn") as HTMLButtonElement;
        const tournamentModeBtn = this.modePage.querySelector("#tournament-btn") as HTMLButtonElement;

        this.modePage.classList.remove("hidden");

        const selectMode = (mode: GameMode) => {
            this.gameMode = mode;
            this.handleSetupPage();
        };

        singleModeBtn    .onclick = () => selectMode("single");
        tournamentModeBtn.onclick = () => selectMode("tournament");
    }

    private createPlayerInputs(): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const count = this.gameMode === "single" ? 2 : 4;
        
        for (let i = 1; i <= count; i++) {
            const div = document.createElement("div");
            div.innerHTML = `
                <input type="text" name="player${i}" placeholder="player${i} name" required>
                <input type="text" name="nickname${i}" placeholder="player${i} nickname" maxlength="10">
            `;
            fragment.appendChild(div);
        }
        
        return (fragment);
    }

    private handleSetupPage(): void {
        this.hideAllPages();

        const formInputs = this.setupForm.formElem.querySelector("#player-inputs")!;
    
        formInputs.innerHTML = "";
        formInputs.appendChild(this.createPlayerInputs());

        this.setupForm.addToPayload("gameMode", this.gameMode);
        this.setupForm.resetStatus();
        this.setupPage.classList.remove("hidden");
    }

    private setupMatches(data?: Player[]): void {
        if (!data?.length) return;

        for (let i = 0; i < data.length; i += 2) {
            const [player1, player2] = [data[i], data[i + 1]];
            this.matches.push({player1, player2, score1: 0, score2: 0});
        }
        
        if (this.gameMode === "tournament")
            this.matches.push({
                player1: { user_id: -1, nickname: "winner1" },
                player2: { user_id: -1, nickname: "winner2" },
                score1: 0, score2: 0});
    }

    private updateTournamentBoard(): void {
        if (this.gameMode !== "tournament") return;

        const elements = this.tournamentBoard.querySelectorAll(".bracket-match");

        elements.forEach((elem, index) => {
            const { player1, player2 } = this.matches[index];

            elem.className = "bracket-match";
            elem.innerHTML = `
                <div class="player">${player1.nickname}</div>
                <div class="vs">vs</div>
                <div class="player">${player2.nickname}</div>
            `;

            if (index < this.matchIndex)
                elem.classList.add("winner");
            else if (index === this.matchIndex)
                elem.classList.add("active");
        });

        this.tournamentBoard.classList.remove("hidden");
    }

    private updateScore(): void {
        const board = this.arenaPage.querySelector("#players-display");
        const match = this.matches[this.matchIndex];

        if (!board || !match) return;

        board.innerHTML = `
            <div class="player-card">
                <h3>${match.player1.nickname}</h3>
                <div class="score">${match.score1}</div>
            </div>
            <div class="vs">vs</div>
            <div class="player-card">
                <h3>${match.player2.nickname}</h3>
                <div class="score">${match.score2}</div>
            </div>
        `;
        this.updateTournamentBoard();
    }

    private addGameHistory(): void {
        const match = this.matches[this.matchIndex];
        if (!match || (match.score1 < 5 && match.score2 < 5))
            return;

        const [winner, loser] = match.score1 > match.score2
            ? [match.player1, match.player2]
            : [match.player2, match.player1];

        this.socket.send({
            type: "gameRecord", game_type: this.gameType,
            win_id: winner.user_id, win_name: winner.nickname,
            lose_id: loser.user_id, lose_name: loser.nickname
        });

        this.showResult();
    }

    private moveToNextMatch(winner: Player): void {
        const finalMatch = this.matches[this.matches.length - 1];
        const isLastMatch = this.matchIndex + 1 >= this.matches.length;

        if (!isLastMatch)
            finalMatch[`player${++this.matchIndex}`] = winner;
    }

    private showResult(): void {
        const isLastMatch = this.matchIndex + 1 >= this.matches.length;
        const match = this.matches[this.matchIndex];
        const winner = match.score1 > match.score2 ? match.player1 : match.player2;
        const title = this.resultPage.querySelector("h2");
        const btn = this.resultPage.querySelector("button");

        if (!title || !btn) return;

        title.textContent = `Match Winner: ${winner.nickname}`;
        btn.textContent = isLastMatch ? "Play Again" : "Next Game";

        btn.onclick = isLastMatch
            ? () => this.load()
            : () => {
                this.moveToNextMatch(winner);
                this.handleArenaPage();
            };

        this.resultPage.classList.remove("hidden");
    }

    private addToScore(playerNumber: number): void {
        const match = this.matches[this.matchIndex];
        if (!match) return;

        match[`score${playerNumber}`]++;
        this.updateScore();

        if (match[`score${playerNumber}`] >= 5) {
            this.addGameHistory();
            return;
        }
        this.handleArenaPage();
    }

    private async handleArenaPage(data?: any) {
        this.hideAllPages();
        this.setupMatches(data?.data);

        this.updateScore();
        this.arenaPage.classList.remove('hidden');

        const currentMatch = this.matches[this.matchIndex];
        if (!currentMatch) return;

        if (this.gameType === GameType.Pong)
            this.addToScore(await this.pong.startGame(!(currentMatch?.score1 + currentMatch?.score2)));
        else if (this.gameType === GameType.RPS)
            this.addToScore(await this.RPS.startGame(currentMatch?.player1.nickname, currentMatch.player2.nickname));
    }

    public load(): httpPromise {
        this.resetPageData();

        if (!this.determineGameType())
            return Promise.reject({ httpCode: 404, httpName: "Not Found" });

        this.handleGameMode();
        return Promise.resolve({ httpCode: 200, httpName: "ok" });
    }

}

export default GameHandler;