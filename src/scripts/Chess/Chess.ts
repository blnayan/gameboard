// TODO: Change square indexing from octals to hexadecimal to compute square validation with just the square index

import { EventEmitter } from "events";
import { FenUtil } from "./Fen";
import { PieceColorFlags, PieceColorSymbol, PieceFlags, PieceSymbol, PieceTypeSymbol, PieceUtil } from "./Piece";

export type Awaitable<T> = PromiseLike<T> | T;

export type Square = `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface PieceTrackData {
  piece: number;
  square: number;
}

export function isDigit(char: string) {
  return "0123456789".split("").includes(char);
}

export function file(square: number) {
  return square & 7;
}

export function rank(square: number) {
  return square >> 3;
}

export function algebraic(square: number): Square {
  const f = file(square);
  const r = rank(square);
  return ("abcdefgh".substring(f, f + 1) + "87654321".substring(r, r + 1)) as Square;
}

export function toSquare(square: Square): number {
  return "87654321".indexOf(square[1]) * 8 + "abcdefgh".indexOf(square[0]);
}

export class Chess extends EventEmitter {
  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    super();
    this.loadFromFen(fen);
  }

  private readonly _board: number[] = [];

  public board() {
    return [...this._board];
  }

  public readonly _pieces: PieceTrackData[] = [];

  public pieces() {
    return [...this._pieces];
  }

  public getPiece(square: number) {
    return this._board[square];
  }

  public logBoard() {
    const squares = [...this._board];

    function formatSquares(squares: number[]) {
      return squares.map((piece) => FenUtil.pieceToFenSymbol(piece) ?? ".").join("  ");
    }

    const string = `
        +------------------------+
      8 | ${formatSquares(squares.slice(0, 8))} |
      7 | ${formatSquares(squares.slice(8, 16))} |
      6 | ${formatSquares(squares.slice(16, 24))} |
      5 | ${formatSquares(squares.slice(24, 32))} |
      4 | ${formatSquares(squares.slice(32, 40))} |
      3 | ${formatSquares(squares.slice(40, 48))} |
      2 | ${formatSquares(squares.slice(48, 56))} |
      1 | ${formatSquares(squares.slice(56, 64))} |
        +------------------------+
          a  b  c  d  e  f  g  h
    `;

    console.log(string);
  }

  public loadFromFen(fen: string) {
    const { board, pieces } = FenUtil.generateBoardFromFen(fen);
    this._board.push(...board);
    this._pieces.push(...pieces);
  }

  public put(piece: number, square: number): PieceTrackData {
    this.remove(square, true);
    this._board[square] = piece;
    this._pieces.push({ piece, square });
    this.emit("pieceAdd", piece, square);
    this.emit("piecesUpdate", this.pieces());

    return { piece, square };
  }

  public remove(square: number, ignorePiecesUpdate?: boolean): PieceTrackData | void {
    const piece = this._board[square];
    this._board[square] = 0;

    if (piece) {
      const pieceTrackDataIndex = this._pieces.findIndex((data) => data.piece === piece && data.square === square);
      this._pieces.splice(pieceTrackDataIndex, 1);
      this.emit("pieceRemove", piece, square);
      if (!ignorePiecesUpdate) this.emit("piecesUpdate", this.pieces());
      return { piece, square };
    }
  }
}

export interface ChessEvents {
  pieceAdd: [piece: number, square: number];
  pieceRemove: [piece: number, square: number];
  boardUpdate: [board: number[]];
  piecesUpdate: [pieces: PieceTrackData[]];
}

export declare interface Chess {
  remove(square: number): PieceTrackData | void;

  on<K extends keyof ChessEvents>(event: K, listener: (...args: ChessEvents[K]) => Awaitable<void>): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ChessEvents>,
    listener: (...args: any[]) => Awaitable<void>
  ): this;

  once<K extends keyof ChessEvents>(event: K, listener: (...args: ChessEvents[K]) => Awaitable<void>): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ChessEvents>,
    listener: (...args: any[]) => Awaitable<void>
  ): this;

  emit<K extends keyof ChessEvents>(event: K, ...args: ChessEvents[K]): boolean;
  emit<S extends string | symbol>(event: Exclude<S, keyof ChessEvents>, ...args: unknown[]): boolean;

  off<K extends keyof ChessEvents>(event: K, listener: (...args: ChessEvents[K]) => Awaitable<void>): this;
  off<S extends string | symbol>(
    event: Exclude<S, keyof ChessEvents>,
    listener: (...args: any[]) => Awaitable<void>
  ): this;

  removeListener<K extends keyof ChessEvents>(event: K, listener: (...args: ChessEvents[K]) => Awaitable<void>): this;
  removeListener<S extends string | symbol>(
    event: Exclude<S, keyof ChessEvents>,
    listener: (...args: any[]) => Awaitable<void>
  ): this;

  removeAllListeners<K extends keyof ChessEvents>(event?: K): this;
  removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ChessEvents>): this;

  listeners<K extends keyof ChessEvents>(event?: K): Function[];
  listeners<S extends string | symbol>(event?: Exclude<S, keyof ChessEvents>): Function[];
}

declare module "node:events" {
  class EventEmitter {
    public static once<E extends EventEmitter, K extends keyof ChessEvents>(
      eventEmitter: E,
      eventName: E extends Chess ? K : string
    ): Promise<E extends Chess ? ChessEvents[K] : any[]>;
    public static on<E extends EventEmitter, K extends keyof ChessEvents>(
      eventEmitter: E,
      eventName: E extends Chess ? K : string
    ): AsyncIterableIterator<E extends Chess ? ChessEvents[K] : any[]>;
  }
}
