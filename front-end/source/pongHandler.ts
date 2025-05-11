interface Coordinates {
    x: number,
    y: number
}

interface ballElem {
    position   : Coordinates,
    velocity   : Coordinates,
    radius     : number
}

interface paddlePair {
    player1    : Coordinates,
    player2    : Coordinates,

    dimensions : Coordinates,
    velocity   : Coordinates
}

class PongHandler {
    //DOM ELEMENT
    private pongPage   : HTMLElement
    private canvas     : HTMLCanvasElement;
    private context    : CanvasRenderingContext2D;

    //PONG JOB
    private refreshJob : number | undefined;

    //CANVAS ELEMENTS
    private ball       : ballElem;
    private paddles    : paddlePair;

    //KEY MANAGEMENT
    private keysPressed: Record<string, boolean> = {};
    private keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    private keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

    //Resolve Promise
    private gameWinner?: (winner: number) => void;

    constructor(sectionID: string, width: number = 800, height: number = 400) {
        const section = document.getElementById(sectionID);
        const canvas = section?.querySelector("canvas") as HTMLCanvasElement | null;
        const context = canvas?.getContext('2d');

        if (!section || !canvas || !context)
            throw new Error("Ping Pong Section not found");

        canvas.width  = width
        canvas.height = height;

        this.pongPage    = section;
        this.canvas  = canvas;
        this.context = context;

        this.initializeElements();
    }

    private initializeBall() {
        this.ball = {position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, radius: 0};

        this.ball.position.x = this.canvas.width / 2;
        this.ball.position.y = this.canvas.height / 2;
        this.ball.velocity.x = Math.random() > 0.5 ? 4 : -4;
        this.ball.velocity.y = Math.random() * 4 - 2;
        this.ball.radius = 6;
    }

    private initializeElements(): void {
        this.initializeBall();
        this.paddles = {
            player1: { x: 0, y: 0 }, player2: { x: 0, y: 0 },
            dimensions: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }
        }

        this.paddles.dimensions.x = 10;
        this.paddles.dimensions.y = 100;
        this.paddles.velocity.x = 0;
        this.paddles.velocity.y = 8;

        this.paddles.player1.x = 20;
        this.paddles.player1.y = (this.canvas.height - this.paddles.dimensions.y) / 2;
        this.paddles.player2.x = this.canvas.width - 20 - this.paddles.dimensions.x;
        this.paddles.player2.y = (this.canvas.height - this.paddles.dimensions.y) / 2;
    }

    private clearCanvas(): void {
        const { width, height } = this.canvas;
    
        this.context.clearRect(0, 0, width, height);
        this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--body-bg');
        this.context.fillRect(0, 0, width, height);

        this.context.beginPath();
        this.context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        this.context.setLineDash([10, 10]);
        this.context.moveTo(width / 2, 0);
        this.context.lineTo(width / 2, height);
        this.context.stroke();
    }

    private renderBall(): void {
        const { position, radius } = this.ball;

        this.context.beginPath();
        this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
        this.context.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.context.fill();
    }

    private renderPaddles(): void {
        const { player1, player2, dimensions } = this.paddles;

        this.context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-brand-color');
        this.context.fillRect(player1.x, player1.y, dimensions.x, dimensions.y);
        this.context.fillRect(player2.x, player2.y, dimensions.x, dimensions.y);
    }

    private moveBall(): void {
        const { position, velocity, radius } = this.ball;
    
        position.x += velocity.x;
        position.y += velocity.y;
    
        const hitTop = position.y - radius < 0;
        const hitBottom = position.y + radius > this.canvas.height;
    
        if (hitTop || hitBottom)
            velocity.y = -velocity.y;

        this.checkPaddleCollision();
    }

    private movePaddles(): void {
        const { height } = this.canvas;
        const { player1, player2, dimensions, velocity } = this.paddles;

        if (this.keysPressed['w'] && player1.y > 0)
            player1.y -= velocity.y;
        if (this.keysPressed['s'] && player1.y < height - dimensions.y)
            player1.y += velocity.y;
        if (this.keysPressed['ArrowUp'] && player2.y > 0)
            player2.y -= velocity.y;
        if (this.keysPressed['ArrowDown'] && player2.y < height - dimensions.y)
            player2.y += velocity.y;
    }

    private checkPaddleCollision(): void {
        const {position, velocity, radius} = this.ball;
        const { player1, player2, dimensions } = this.paddles;
    
        if (velocity.x < 0) {
            const ballLeft = position.x - radius;
            const paddleRight = player1.x + dimensions.x;
            
            if (ballLeft <= paddleRight && ballLeft >= player1.x) {
                const ballBottom = position.y + radius;
                const ballTop = position.y - radius;
                const paddleBottom = player1.y + dimensions.y;
                
                if (ballBottom >= player1.y && ballTop <= paddleBottom) {
                    const hitPos = (position.y - (player1.y + dimensions.y / 2)) / (dimensions.y / 2);
                    velocity.x = -velocity.x * 1.05;
                    velocity.y = hitPos * 5;
                }
            }
        }
        else if (velocity.x > 0) {
            const ballRight = position.x + radius;
            const paddleLeft = player2.x;
            
            if (ballRight >= paddleLeft && ballRight <= player2.x + dimensions.x) {
                const ballBottom = position.y + radius;
                const ballTop = position.y - radius;
                const paddleBottom = player2.y + dimensions.y;
                
                if (ballBottom >= player2.y && ballTop <= paddleBottom) {
                    const hitPos = (position.y - (player2.y + dimensions.y / 2)) / (dimensions.y / 2);
                    velocity.x = -velocity.x * 1.05;
                    velocity.y = hitPos * 5;
                }
            }
        }
    }

    private isGameEnd() {
        const {position, radius} = this.ball;

        if (position.x + radius > this.canvas.width)
            this.endGame(1);
        else if (position.x - radius < 0)
            this.endGame(2);
    }

    private render() {
        this.clearCanvas();
        this.renderBall();
        this.renderPaddles();
        this.moveBall();
        this.movePaddles();
        this.isGameEnd();
    }

    private handleKeyDown(e: KeyboardEvent): void {
        this.keysPressed[e.key] = true;
    }

    private handleKeyUp(e: KeyboardEvent): void {
        this.keysPressed[e.key] = false;
    }

    private endGame(winnerNumber: number): void {
        if (this.refreshJob)
            clearInterval(this.refreshJob);

        this.refreshJob = undefined;
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        this.pongPage.className = "hidden";
    
        if (this.gameWinner) {
            this.gameWinner(winnerNumber);
            this.gameWinner = undefined;
        }
    }

    public async startGame(resetWholeGame: boolean = false) {
        return new Promise<number>((resolve) => {
            this.gameWinner = resolve;
            
            this.pongPage.className = "";

            document.addEventListener('keydown', this.keyDownHandler);
            document.addEventListener('keyup', this.keyUpHandler);

            if (resetWholeGame)
                this.initializeElements();
            else
                this.initializeBall();

            if (this.refreshJob)
                clearInterval(this.refreshJob);

            this.refreshJob = window.setInterval(() => this.render(), 16);
        });
    }

    public destroyGame() {
        this.endGame(0);
    }
}

export default PongHandler;