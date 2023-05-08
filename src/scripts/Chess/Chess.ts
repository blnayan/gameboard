import { EventEmitter } from "events";
import { FenPieceSymbol, fenSymbolToPiece, getFenObject, isValidFen, pieceToFenSymbol } from "./Fen";
import { isValidPiece } from "./Piece";

export type Awaitable<T> = PromiseLike<T> | T;

export type Square = `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface PieceTrackData {
  piece: number;
  square: number;
}

// prettier-ignore
const Ox88: Record<Square, number> = {
  a8: 0x00, b8: 0x01, c8: 0x02, d8: 0x03, e8: 0x04, f8: 0x05, g8: 0x06, h8: 0x07, 
  a7: 0x10, b7: 0x11, c7: 0x12, d7: 0x13, e7: 0x14, f7: 0x15, g7: 0x16, h7: 0x17, 
  a6: 0x20, b6: 0x21, c6: 0x22, d6: 0x23, e6: 0x24, f6: 0x25, g6: 0x26, h6: 0x27, 
  a5: 0x30, b5: 0x31, c5: 0x32, d5: 0x33, e5: 0x34, f5: 0x35, g5: 0x36, h5: 0x37, 
  a4: 0x40, b4: 0x41, c4: 0x42, d4: 0x43, e4: 0x44, f4: 0x45, g4: 0x46, h4: 0x47, 
  a3: 0x50, b3: 0x51, c3: 0x52, d3: 0x53, e3: 0x54, f3: 0x55, g3: 0x56, h3: 0x57, 
  a2: 0x60, b2: 0x61, c2: 0x62, d2: 0x63, e2: 0x64, f2: 0x65, g2: 0x66, h2: 0x67, 
  a1: 0x70, b1: 0x71, c1: 0x72, d1: 0x73, e1: 0x74, f1: 0x75, g1: 0x76, h1: 0x77,
}

// bitwise is slower in js because of conversion between 64-bit and 32-bit
// Extracts the zero-based rank of an 0x88 square
export function rank(square: number): number {
  return square >> 4;
}

// Extracts the zero-based file of an 0x88 square
export function file(square: number): number {
  return square & 0xf;
}

export function isDigit(c: string): boolean {
  return "0123456789".includes(c);
}

// Converts a 0x88 square to algebraic notation
export function algebraic(square: number): Square {
  const f = file(square);
  const r = rank(square);
  return ("abcdefgh".substring(f, f + 1) + "87654321".substring(r, r + 1)) as Square;
}

export function isValidSquare(square: number) {
  return !(square & 0x88);
}

export class Chess extends EventEmitter {
  private readonly _board = new Array<number>(128);
  private readonly _pieces: PieceTrackData[] = [];

  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    super();
    this.load(fen);
  }

  public board() {
    return [
      ...this._board.slice(Ox88.a8, Ox88.h8 + 1),
      ...this._board.slice(Ox88.a7, Ox88.h7 + 1),
      ...this._board.slice(Ox88.a6, Ox88.h6 + 1),
      ...this._board.slice(Ox88.a5, Ox88.h5 + 1),
      ...this._board.slice(Ox88.a4, Ox88.h4 + 1),
      ...this._board.slice(Ox88.a3, Ox88.h3 + 1),
      ...this._board.slice(Ox88.a2, Ox88.h2 + 1),
      ...this._board.slice(Ox88.a1, Ox88.h1 + 1),
    ];
  }

  public pieces() {
    return [...this._pieces];
  }

  public getPiece(square: number) {
    return this._board[square];
  }

  public logBoard() {
    function formatSquares(boardRow: number[]) {
      return boardRow.map((piece) => (piece ? pieceToFenSymbol(piece) : ".")).join("  ");
    }

    const string = `
        +------------------------+
      8 | ${formatSquares(this._board.slice(Ox88.a8, Ox88.h8 + 1))} |
      7 | ${formatSquares(this._board.slice(Ox88.a7, Ox88.h7 + 1))} |
      6 | ${formatSquares(this._board.slice(Ox88.a6, Ox88.h6 + 1))} |
      5 | ${formatSquares(this._board.slice(Ox88.a5, Ox88.h5 + 1))} |
      4 | ${formatSquares(this._board.slice(Ox88.a4, Ox88.h4 + 1))} |
      3 | ${formatSquares(this._board.slice(Ox88.a3, Ox88.h3 + 1))} |
      2 | ${formatSquares(this._board.slice(Ox88.a2, Ox88.h2 + 1))} |
      1 | ${formatSquares(this._board.slice(Ox88.a1, Ox88.h1 + 1))} |
        +------------------------+
          a  b  c  d  e  f  g  h
    `;

    console.log(string);
  }

  public load(fen: string) {
    if (!isValidFen(fen)) return;

    const { piecePlacement } = getFenObject(fen);

    let square = 0;

    for (const symbol of piecePlacement) {
      if (symbol === "/") square += 8;
      else if (isDigit(symbol)) square += parseInt(symbol);
      else {
        this._put(fenSymbolToPiece(symbol as FenPieceSymbol), square);
        square++;
      }
    }
  }

  private _put(piece: number, square: number) {
    this._remove(square);
    this._board[square] = piece;
    this._pieces.push({ piece, square });
    return { piece, square };
  }

  private _remove(square: number) {
    const piece = this.getPiece(square);
    delete this._board[square];

    if (piece)
      this._pieces.splice(
        this._pieces.findIndex((data) => data.piece === piece && data.square === square),
        1
      );

    return { piece, square };
  }

  public put(piece: number, square: number): PieceTrackData {
    if (!isValidSquare(square)) throw new Error("Invalid Square");
    if (!isValidPiece(piece)) throw new Error("Invalid Piece");
    const data = this._put(piece, square);
    this.emit("pieceAdd", data);
    this.emit("piecesUpdate", this.pieces());
    return data;
  }

  public remove(square: number): PieceTrackData {
    if (!isValidSquare(square)) throw new Error("Invalid Square");
    const data = this._remove(square);
    this.emit("pieceRemove", data);
    this.emit("piecesUpdate", this.pieces());
    return data;
  }
}

export interface ChessEvents {
  pieceAdd: [data: PieceTrackData];
  pieceRemove: [data: PieceTrackData];
  boardUpdate: [board: number[]];
  piecesUpdate: [pieces: PieceTrackData[]];
}

export declare interface Chess {
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
