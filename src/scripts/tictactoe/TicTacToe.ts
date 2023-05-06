import { EventEmitter } from "events";

export type Player = "X" | "O" | "";
export type Board = Player[][];

export interface Move {
    player: Player;
    row: number;
    col: number;
  }
  

export enum BotDifficulty {
  EASY,
  MEDIUM,
  HARD,
}

export class TicTacToe extends EventEmitter {
  private board: Board;
  private currentPlayer: Player;
  private movesCount = 0;
  private bot?: BotDifficulty;

  constructor(botDifficulty?: BotDifficulty) {
    super();
    this.board = this.createEmptyBoard();
    this.currentPlayer = "X";
    if (botDifficulty !== undefined) {
      this.bot = botDifficulty;
    }
  }

  private createEmptyBoard(): Board {
    return Array.from({ length: 3 }, () => Array(3).fill(""));
  }

  public getBoard(): Board {
    return this.board.map((row) => [...row]);
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  public makeMove(row: number, col: number): boolean {
    if (this.board[row][col] !== "" || this.isGameOver()) {
      return false;
    }

    this.board[row][col] = this.currentPlayer;
    this.emit("move", { player: this.currentPlayer, row, col });

    this.movesCount++;

    if (this.isTie()) {
      this.emit("tie");
      return true;
    }

    if (this.isGameOver()) {
      this.emit("gameOver", this.currentPlayer);
    } else {
      this.switchPlayer();
      if (this.bot !== undefined && this.getCurrentPlayer() == "O") {
        this.makeBotMove();
      }
    }

    return true;
  }

  isTie(): boolean {
    return this.movesCount === 9;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
  }

  public makeBotMove(): void {
    if (this.bot === BotDifficulty.EASY) {
      this.makeRandomMove();
    } else if (this.bot === BotDifficulty.MEDIUM) {
      if (Math.random() > 0.5) {
        this.makeRandomMove();
      } else {
        this.makeComputedMove();
      }
    } else if (this.bot === BotDifficulty.HARD) {
      this.makeComputedMove();
    }
  }
  
  private makeComputedMove(): void {
    const winningMove = this.findWinningMove();
    if (winningMove) {
      this.makeMove(winningMove.row, winningMove.col);
      return;
    }
  
    const blockingMove = this.findBlockingMove();
    if (blockingMove) {
      this.makeMove(blockingMove.row, blockingMove.col);
      return;
    }
  
    this.makeRandomMove();
  }
  
  private findWinningMove(): Move | null {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.board[row][col] === "") {
          this.board[row][col] = this.currentPlayer;
          if (this.isGameOver()) {
            this.board[row][col] = "";
            return { player: this.currentPlayer, row, col };
          }
          this.board[row][col] = "";
        }
      }
    }
    return null;
  }
  
  private findBlockingMove(): Move | null {
    const opponent = this.currentPlayer === "X" ? "O" : "X";
  
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.board[row][col] === "") {
          this.board[row][col] = opponent;
          if (this.isGameOver()) {
            this.board[row][col] = "";
            return { player: this.currentPlayer, row, col };
          }
          this.board[row][col] = "";
        }
      }
    }
    return null;
  }
  
  

  private makeRandomMove(): void {
    let emptyCells = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.board[row][col] === "") {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];
    console.log(row, col)
    this.makeMove(row, col);
  }

  public isGameOver(): boolean {
    return this.checkRows() || this.checkColumns() || this.checkDiagonals();
  }

  private checkRows(): boolean {
    return this.board.some((row) => this.allEqual(row));
  }

  private checkColumns(): boolean {
    for (let col = 0; col < 3; col++) {
      if (this.allEqual(this.board.map((row) => row[col]))) {
        return true;
      }
    }
    return false;
  }

  private checkDiagonals(): boolean {
    const diagonal1 = [this.board[0][0], this.board[1][1], this.board[2][2]];
    const diagonal2 = [this.board[0][2], this.board[1][1], this.board[2][0]];

    return this.allEqual(diagonal1) || this.allEqual(diagonal2);
  }

  private allEqual(array: Player[]): boolean {
    return array.every((value) => value === array[0] && value !== "");
  }
}

export interface TicTacToeEvents {
  tie: [];
  move: [move: Move];
  gameOver: [winner: Player];
}

export declare interface TicTacToe {
  on<K extends keyof TicTacToeEvents>(
    event: K,
    listener: (...args: TicTacToeEvents[K]) => void
  ): this;

  once<K extends keyof TicTacToeEvents>(
    event: K,
    listener: (...args: TicTacToeEvents[K]) => void
  ): this;

  emit<K extends keyof TicTacToeEvents>(event: K, ...args: TicTacToeEvents[K]): boolean;

  off<K extends keyof TicTacToeEvents>(
    event: K,
    listener: (...args: TicTacToeEvents[K]) => void
  ): this;

  removeAllListeners<K extends keyof TicTacToeEvents>(event?: K): this;
}
