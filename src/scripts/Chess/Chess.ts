import { EventEmitter } from "events";
import { DEFAULT_FEN, FenPieceSymbol, fenSymbolToPiece, getFenObject, isValidFen, pieceToFenSymbol } from "./Fen";
import {
  PieceColorFlags,
  PieceFlags,
  isValidPiece,
  getPieceColor,
  getPieceType,
  SlidingPieceTypeFlags,
  isPieceColor,
  isValidPromotionPiece,
  isPieceType,
  PromotionPieceTypeFlags,
} from "./Piece";

export enum ChessErrorCodes {
  InvalidFromSquare = "InvalidFromSquare",
  InvalidToSquare = "InvalidToSquare",
  OutOfRangeSquare = "OutOfRangeSquare",
  IllegalMove = "IllegalMove",
  InvalidPromotionPiece = "InvalidPromotionPiece"
}

export type Awaitable<T> = PromiseLike<T> | T;

export type Square = `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface PieceTrackData {
  piece: number;
  square: number;
}

export interface MakeMoveData {
  from: number;
  to: number;
  promotion?: number;
}

export interface Move {
  color: Color;
  from: number;
  to: number;
  piece: number;
  captured?: number;
  promotion?: number;
  flags: MoveFlags;
}

export enum MoveFlags {
  Normal = 1,
  Capture = 2,
  // Big Pawn just represents a move that enables en-passant
  BigPawn = 4,
  EnPassantCapture = 8,
  Promotion = 16,
  KingSideCastle = 32,
  QueenSideCastle = 64,
}

interface MoveHistory {
  move: Move;
  turn: Color;
  castling: Record<Color, number>;
  epSquare: number | null;
  halfMoves: number;
  fullMoves: number;
}

export type Color = PieceColorFlags;

/** `PIECE_OFFSETS` is a collection of piece offsets of a 8x16 board, so that when added to any square index gives the destination square index*/
export const PIECE_OFFSETS = {
  [PieceFlags.King]: [-17, -16, -15, 1, 17, 16, 15, -1],
  [PieceFlags.Pawn]: { [PieceFlags.White]: [-16, -32, -17, -15], [PieceFlags.Black]: [16, 32, 17, 15] },
  [PieceFlags.Knight]: [-18, -33, -31, -14, 18, 33, 31, 14],
  [PieceFlags.Bishop]: [-17, -15, 17, 15],
  [PieceFlags.Rook]: [-16, 1, 16, -1],
  [PieceFlags.Queen]: [-17, -16, -15, 1, 17, 16, 15, -1],
};

// prettier-ignore
/** `ATTACKS`: A list of piece masks that are indexed on the relative distance of any 2 given squares. */
const ATTACKS = [
  40,  0,  0,  0,  0,  0,  0, 48,  0,  0,  0,  0,  0,  0, 40,,
   0, 40,  0,  0,  0,  0,  0, 48,  0,  0,  0,  0,  0, 40,  0,,
   0,  0, 40,  0,  0,  0,  0, 48,  0,  0,  0,  0, 40,  0,  0,,
   0,  0,  0, 40,  0,  0,  0, 48,  0,  0,  0, 40,  0,  0,  0,,
   0,  0,  0,  0, 40,  0,  0, 48,  0,  0, 40,  0,  0,  0,  0,,
   0,  0,  0,  0,  0, 40,  4, 48,  4, 40,  0,  0,  0,  0,  0,,
   0,  0,  0,  0,  0,  4, 43, 49, 43,  4,  0,  0,  0,  0,  0,,
  48, 48, 48, 48, 48, 48, 49,  0, 49, 48, 48, 48, 48, 48, 48,,
   0,  0,  0,  0,  0,  4, 43, 49, 43,  4,  0,  0,  0,  0,  0,,
   0,  0,  0,  0,  0, 40,  4, 48,  4, 40,  0,  0,  0,  0,  0,,
   0,  0,  0,  0, 40,  0,  0, 48,  0,  0, 40,  0,  0,  0,  0,,
   0,  0,  0, 40,  0,  0,  0, 48,  0,  0,  0, 40,  0,  0,  0,,
   0,  0, 40,  0,  0,  0,  0, 48,  0,  0,  0,  0, 40,  0,  0,,
   0, 40,  0,  0,  0,  0,  0, 48,  0,  0,  0,  0,  0, 40,  0,,
  40,  0,  0,  0,  0,  0,  0, 48,  0,  0,  0,  0,  0,  0, 40
] as number[];

// prettier-ignore
const RAYS = [
  -17,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-15,,
    0,-17,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-15,  0,,
    0,  0,-17,  0,  0,  0,  0,-16,  0,  0,  0,  0,-15,  0,  0,,
    0,  0,  0,-17,  0,  0,  0,-16,  0,  0,  0,-15,  0,  0,  0,,
    0,  0,  0,  0,-17,  0,  0,-16,  0,  0,-15,  0,  0,  0,  0,,
    0,  0,  0,  0,  0,-17,  0,-16,  0,-15,  0,  0,  0,  0,  0,,
    0,  0,  0,  0,  0,  0,-17,-16,-15,  0,  0,  0,  0,  0,  0,,
   -1, -1, -1, -1, -1, -1, -1,  0,  1,  1,  1,  1,  1,  1,  1,,
    0,  0,  0,  0,  0,  0, 15, 16, 17,  0,  0,  0,  0,  0,  0,,
    0,  0,  0,  0,  0, 15,  0, 16,  0, 17,  0,  0,  0,  0,  0,,
    0,  0,  0,  0, 15,  0,  0, 16,  0,  0, 17,  0,  0,  0,  0,,
    0,  0,  0, 15,  0,  0,  0, 16,  0,  0,  0, 17,  0,  0,  0,,
    0,  0, 15,  0,  0,  0,  0, 16,  0,  0,  0,  0, 17,  0,  0,,
    0, 15,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 17,  0,,
   15,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 17
] as number[];

// // prettier-ignore
// const SQUARES: Record<Square, number> = {
//   a8: 0x00, b8: 0x01, c8: 0x02, d8: 0x03, e8: 0x04, f8: 0x05, g8: 0x06, h8: 0x07,
//   a7: 0x10, b7: 0x11, c7: 0x12, d7: 0x13, e7: 0x14, f7: 0x15, g7: 0x16, h7: 0x17,
//   a6: 0x20, b6: 0x21, c6: 0x22, d6: 0x23, e6: 0x24, f6: 0x25, g6: 0x26, h6: 0x27,
//   a5: 0x30, b5: 0x31, c5: 0x32, d5: 0x33, e5: 0x34, f5: 0x35, g5: 0x36, h5: 0x37,
//   a4: 0x40, b4: 0x41, c4: 0x42, d4: 0x43, e4: 0x44, f4: 0x45, g4: 0x46, h4: 0x47,
//   a3: 0x50, b3: 0x51, c3: 0x52, d3: 0x53, e3: 0x54, f3: 0x55, g3: 0x56, h3: 0x57,
//   a2: 0x60, b2: 0x61, c2: 0x62, d2: 0x63, e2: 0x64, f2: 0x65, g2: 0x66, h2: 0x67,
//   a1: 0x70, b1: 0x71, c1: 0x72, d1: 0x73, e1: 0x74, f1: 0x75, g1: 0x76, h1: 0x77,
// }

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

export function anTosquare(s: Square) {
  return "abcdefgh".indexOf(s[0]) * 16 + "87654321".indexOf(s[1]);
}

export function isValidSquare(square: number) {
  return !(square & 0x88);
}

export function isPromotionSquare(square: number) {
  if (!isValidSquare(square)) return false;
  const r = rank(square);
  // prettier-ignore
  return r === 0 || r === 7;
}

export function swapColor(color: PieceColorFlags): Color {
  return isPieceColor(color, PieceFlags.White) ? PieceFlags.Black : PieceFlags.White;
}

export class Chess extends EventEmitter {
  private readonly _board = new Array<number>(128);
  private readonly _pieces: PieceTrackData[] = [];
  private _turn: Color = PieceFlags.White;
  private _castling: Record<Color, number> = { [PieceFlags.White]: 0, [PieceFlags.Black]: 0 };
  private _epSquare: number | null = null;
  /** `_halfMoves`: counts everytime each side moves and resets on pawn advances or captures */
  private _halfMoves: number = 0;
  /** `_fullMoves`: counts after black moves */
  private _fullMoves: number = 0;
  private _history: MoveHistory[] = [];

  constructor(fen = DEFAULT_FEN) {
    super();
    this.load(fen);
  }

  public board() {
    return [
      ...this._board.slice(0x00, 0x08),
      ...this._board.slice(0x10, 0x18),
      ...this._board.slice(0x20, 0x28),
      ...this._board.slice(0x30, 0x38),
      ...this._board.slice(0x40, 0x48),
      ...this._board.slice(0x50, 0x58),
      ...this._board.slice(0x60, 0x68),
      ...this._board.slice(0x70, 0x78),
    ];
  }

  public pieces() {
    return [...this._pieces];
  }

  get turn() {
    return this._turn;
  }

  get epSquare() {
    return this._epSquare;
  }

  get castling() {
    return structuredClone(this._castling);
  }

  public getPiece(square: number) {
    return this._board[square];
  }

  public logBoard() {
    const board = [...this._board];
    function formatSquares(boardRow: number[]) {
      return boardRow.map((piece) => (piece ? pieceToFenSymbol(piece) : ".")).join("  ");
    }

    const string = `
        +------------------------+
      8 | ${formatSquares(board.slice(0x00, 0x08))} |
      7 | ${formatSquares(board.slice(0x10, 0x18))} |
      6 | ${formatSquares(board.slice(0x20, 0x28))} |
      5 | ${formatSquares(board.slice(0x30, 0x38))} |
      4 | ${formatSquares(board.slice(0x40, 0x48))} |
      3 | ${formatSquares(board.slice(0x50, 0x58))} |
      2 | ${formatSquares(board.slice(0x60, 0x68))} |
      1 | ${formatSquares(board.slice(0x70, 0x78))} |
        +------------------------+
          a  b  c  d  e  f  g  h
    `;

    console.log(string);
  }

  public load(fen: string) {
    if (!isValidFen(fen)) return;

    const { piecePlacement, sideToMove, castling, enPassant, halfMoveClock, fullMoveNumber } = getFenObject(fen);

    let square = 0;

    for (const symbol of piecePlacement) {
      if (symbol === "/") square += 8;
      else if (isDigit(symbol)) square += parseInt(symbol);
      else {
        this._put(fenSymbolToPiece(symbol as FenPieceSymbol), square);
        square++;
      }
    }

    this._turn = sideToMove === "w" ? PieceFlags.White : PieceFlags.Black;

    if (castling.includes("K")) this._castling[PieceFlags.White] |= MoveFlags.KingSideCastle;
    if (castling.includes("Q")) this._castling[PieceFlags.White] |= MoveFlags.QueenSideCastle;
    if (castling.includes("k")) this._castling[PieceFlags.Black] |= MoveFlags.KingSideCastle;
    if (castling.includes("q")) this._castling[PieceFlags.Black] |= MoveFlags.QueenSideCastle;

    this._epSquare = enPassant === "-" ? null : anTosquare(enPassant as Square);
    this._halfMoves = parseInt(halfMoveClock);
    this._fullMoves = parseInt(fullMoveNumber);
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

  // Pseudolegal moves means a move that opens an enemy check or checkmate.
  /** `_generateSlidingMoves()`: Generates pseudolegal moves for sliding pieces Bishop, Rook, and Queen. */
  private _generateSlidingMoves(square: number, color: PieceColorFlags, type: SlidingPieceTypeFlags): Move[] {
    const moves: Move[] = [];
    const piece = color | type;
    const offsets = PIECE_OFFSETS[type];

    for (const offset of offsets) {
      for (let i = 1; i < 9; i++) {
        const to = square + i * offset;

        if (!isValidSquare(to)) break;

        const toPiece = this.getPiece(to);

        if (!toPiece) {
          moves.push({
            color,
            from: square,
            to: to,
            piece,
            flags: MoveFlags.Normal,
          });

          continue;
        }

        const isSameColor = isPieceColor(toPiece, color);

        if (isSameColor) break;

        moves.push({
          color,
          from: square,
          to: to,
          piece,
          captured: toPiece,
          flags: MoveFlags.Capture,
        });

        break;
      }
    }

    return moves;
  }

  /** `_generateKingAndKnightMoves()`: Generates pseudolegal moves for King and Knight. */
  private _generateKingAndKnightMoves(
    square: number,
    color: PieceColorFlags,
    type: PieceFlags.King | PieceFlags.Knight
  ): Move[] {
    const moves: Move[] = [];
    const piece = color | type;
    const offsets = PIECE_OFFSETS[type];

    for (const offset of offsets) {
      // calculates which square the offset generates
      const to = square + offset;

      // checks if square is not outside the board
      if (!isValidSquare(to)) continue;

      const toPiece = this.getPiece(to);

      // if no piece on offset square it's a normal move
      if (!toPiece) {
        moves.push({
          color,
          from: square,
          to: to,
          piece,
          flags: MoveFlags.Normal,
        });

        continue;
      }

      const isSameColor = isPieceColor(toPiece, color);

      // if it's the same colored piece then it's not a valid move, since you can't capture your own piece
      if (isSameColor) continue;

      // if it's a different colored piece than it captures
      moves.push({
        color,
        from: square,
        to: to,
        piece,
        captured: toPiece,
        flags: MoveFlags.Capture,
      });
    }

    return moves;
  }

  /** `_generatePawnMoves()`: Generates pseudolegal moves for Pawn. */
  private _generatePawnMoves(square: number, color: PieceColorFlags, type: PieceFlags.Pawn): Move[] {
    const moves: Move[] = [];
    const piece = color | type;
    const offsets = PIECE_OFFSETS[type][color];
    const promotionPieceTypeList: PromotionPieceTypeFlags[] = [
      PieceFlags.Knight,
      PieceFlags.Bishop,
      PieceFlags.Rook,
      PieceFlags.Queen,
    ];

    // goes through the possible offset of a pawn
    for (let i = 0, length = offsets.length; i < length; i++) {
      const r = rank(square);

      if (
        i === 1 &&
        ((isPieceColor(piece, PieceFlags.White) && r !== 6) || (isPieceColor(piece, PieceFlags.Black) && r !== 1))
      )
        continue;

      const offset = offsets[i];
      const to = square + offset;

      if (!isValidSquare(to)) continue;

      const toPiece = this.getPiece(to);

      if ((i === 0 || i === 1) && !toPiece) {
        if (isPromotionSquare(to)) {
          for (const promotionPieceType of promotionPieceTypeList) {
            moves.push({
              color,
              from: square,
              to: to,
              piece,
              promotion: promotionPieceType | color,
              flags: MoveFlags.Promotion,
            });
          }
        } else {
          moves.push({
            color,
            from: square,
            to: to,
            piece,
            flags: i === 1 ? MoveFlags.BigPawn : MoveFlags.Normal,
          });
        }

        continue;
      }

      if (i === 0 || i === 1 || ((i === 2 || i === 3) && !toPiece)) continue;

      const isSameColor = isPieceColor(toPiece, color);

      if (isSameColor) continue;

      if (isPromotionSquare(to)) {
        for (const promotionPieceType of promotionPieceTypeList) {
          moves.push({
            color,
            from: square,
            to: to,
            piece,
            captured: toPiece,
            promotion: promotionPieceType | color,
            flags: MoveFlags.Capture | MoveFlags.Promotion,
          });
        }
      } else {
        moves.push({
          color,
          from: square,
          to: to,
          piece,
          captured: toPiece,
          flags: MoveFlags.Capture,
        });
      }
    }

    return moves;
  }

  /** `_generateSpecialMoves()`: Generates pseudolegal en-passant and castling moves. */
  private _generateSpecialMoves(
    square: number,
    color: PieceColorFlags,
    type: PieceFlags.Pawn | PieceFlags.King
  ): Move[] {
    const moves: Move[] = [];
    const piece = color | type;

    // checks for en-passant move
    // _epSquare can never be zero so it's safe for comparison
    if (isPieceType(piece, PieceFlags.Pawn) && this._epSquare) {
      if (isPieceColor(piece, PieceFlags.White) && [this._epSquare + 17, this._epSquare + 15].includes(square)) {
        moves.push({
          color,
          from: square,
          to: square - 17 === this._epSquare ? square - 17 : square - 15,
          piece,
          captured: PieceFlags.Black | PieceFlags.Pawn,
          flags: MoveFlags.EnPassantCapture,
        });
      } else if ([this._epSquare - 17, this._epSquare - 15].includes(square)) {
        moves.push({
          color,
          from: square,
          to: square + 17 === this._epSquare ? square + 17 : square + 15,
          piece,
          captured: PieceFlags.White | PieceFlags.Pawn,
          flags: MoveFlags.EnPassantCapture,
        });
      }
    }

    if (isPieceType(piece, PieceFlags.King) && this._castling[color]) {
      if (
        this._castling[color] & MoveFlags.QueenSideCastle &&
        !this.getPiece(square - 1) &&
        !this.getPiece(square - 2) &&
        !this.getPiece(square - 3)
      ) {
        moves.push({
          color,
          from: square,
          to: square - 2,
          piece,
          flags: MoveFlags.QueenSideCastle,
        });
      }

      if (
        this._castling[color] & MoveFlags.KingSideCastle &&
        !this.getPiece(square + 1) &&
        !this.getPiece(square + 2)
      ) {
        moves.push({
          color,
          from: square,
          to: square + 2,
          piece,
          flags: MoveFlags.KingSideCastle,
        });
      }
    }

    return moves;
  }

  /** `_generateMoves()`: Generates pseudolegal moves for all the pecies. */
  private _generateMoves(square?: number): Move[] {
    const moves: Move[] = [];
    const friendlyColor = this._turn;

    if (square === undefined) {
      for (const { piece, square } of this._pieces) {
        if (!isPieceColor(piece, friendlyColor)) continue;
        moves.push(...this._generateMoves(square));
      }

      return moves;
    }

    const piece = this.getPiece(square);

    if (!piece || !isPieceColor(piece, friendlyColor)) return [];

    const color = getPieceColor(piece);
    const type = getPieceType(piece);

    if ([PieceFlags.Bishop, PieceFlags.Rook, PieceFlags.Queen].includes(type)) {
      moves.push(...this._generateSlidingMoves(square, color, type as SlidingPieceTypeFlags));
    } else if ([PieceFlags.King, PieceFlags.Knight].includes(type)) {
      moves.push(...this._generateKingAndKnightMoves(square, color, type as PieceFlags.King | PieceFlags.Knight));
    } else if ([PieceFlags.Pawn].includes(type)) {
      moves.push(...this._generatePawnMoves(square, color, type as PieceFlags.Pawn));
    }

    if ([PieceFlags.Pawn, PieceFlags.King].includes(type))
      moves.push(...this._generateSpecialMoves(square, color, type as PieceFlags.Pawn | PieceFlags.King));

    return moves;
  }

  // generates all legal moves
  public generateLegalMoves(square?: number): Move[] {
    const friendlyColor = this._turn;
    const pseudoLegalMoves = this._generateMoves(square);
    const legalMoves: Move[] = [];

    for (const moveToVerify of pseudoLegalMoves) {
      this._makeMove(moveToVerify);
      if (!this._isKingAttacked(friendlyColor)) legalMoves.push(moveToVerify);
      this._undoMove();
    }

    return legalMoves;
  }

  // checks to see if a specific square and piece is attacked
  private _attacked(square: number, piece: number) {
    let count = 0;
    for (const { piece: fromPiece, square: fromSquare } of this._pieces) {
      if (isPieceColor(fromPiece, getPieceColor(piece))) continue;

      const difference = fromSquare - square;
      const index = difference + 119;

      if (ATTACKS[index] & getPieceType(fromPiece)) {
        if (isPieceType(fromPiece, PieceFlags.Pawn)) {
          if (difference > 0 && isPieceColor(fromPiece, PieceFlags.White)) return true;
          if (isPieceColor(fromPiece, PieceFlags.Black)) return true;
          continue;
        }

        if (isPieceType(fromPiece, PieceFlags.King) || isPieceType(fromPiece, PieceFlags.Knight)) return true;

        const offset = -1 * RAYS[index];
        let offsetSquare = fromSquare + offset;
        let blocked = false;

        while (offsetSquare !== square) {
          if (this.getPiece(offsetSquare)) {
            blocked = true;
            break;
          }

          offsetSquare += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  // checks to see if the king is being attacked or checked
  private _isKingAttacked(color: PieceColorFlags) {
    const king = this._pieces.find(
      (data) => isPieceType(data.piece, PieceFlags.King) && isPieceColor(data.piece, color)
    );

    if (!king) throw "King Down";

    return this._attacked(king.square, king.piece);
  }

  // checks if the game is on a check
  public isCheck() {
    return this._isKingAttacked(this._turn);
  }

  // checks if the game is a checkmate
  public isCheckmate() {
    return this.isCheck() && this.generateLegalMoves().length === 0;
  }

  // checks if the game is a stalemate
  public isStalemate() {
    return !this.isCheck() && this.generateLegalMoves().length === 0;
  }

  // checks if the game is a draw
  public isDraw() {
    const pieces = this._pieces.map(({ piece }) => piece);
    const stalemate = this.isStalemate();

    if (stalemate) return true;

    if (pieces.length > 4) return false;

    // draw if king vs king
    if (pieces.length === 2) return true;

    // draw if both side has bishop as the last piece remaining
    if (pieces.includes(PieceFlags.White | PieceFlags.Bishop) && pieces.includes(PieceFlags.Black | PieceFlags.Bishop))
      return true;

    if (pieces.length > 3) return false;

    // draw if the last piece on either side is bishop or a knight
    if (pieces.find((piece) => isPieceType(piece, PieceFlags.Bishop) || isPieceType(piece, PieceFlags.Knight)))
      return true;

    return false;
  }

  // goes back one move logically using move history
  private _undoMove() {
    const old = this._history.pop();

    if (!old) return null;

    const { move, turn, castling, epSquare, halfMoves, fullMoves } = old;

    this._turn = turn;
    this._castling = castling;
    this._epSquare = epSquare;
    this._halfMoves = halfMoves;
    this._fullMoves = fullMoves;

    const { from, to, piece, captured, flags } = move;

    this._put(piece, from);
    this._remove(to);

    // put captured pieces back were they were
    if (captured) {
      if (flags & MoveFlags.EnPassantCapture) {
        if (isPieceColor(piece, PieceFlags.White)) this._put(captured, to + 16);
        else this._put(captured, to - 16);
      } else this._put(captured, to);
    }

    // if it's a castle move undo rook placement
    if (flags & MoveFlags.KingSideCastle) {
      const castlingTo = to - 1;
      const castlingFrom = to + 1;
      this._put(this._board[castlingTo], castlingFrom);
      this._remove(castlingTo);
    } else if (flags & MoveFlags.QueenSideCastle) {
      const castlingTo = to + 1;
      const castlingFrom = to - 2;
      this._put(this._board[castlingTo], castlingFrom);
      this._remove(castlingTo);
    }

    return move;
  }

  // logically makes a chess move
  private _makeMove(move: Move) {
    const { color, from, to, piece, promotion, captured, flags } = move;
    const enemyColor = swapColor(color);

    this._history.push({
      move: structuredClone(move),
      turn: this._turn,
      castling: structuredClone(this._castling),
      epSquare: this._epSquare,
      halfMoves: this._halfMoves,
      fullMoves: this._fullMoves,
    });

    this._remove(from);
    this._put(piece, to);

    // if en-passant move
    if (flags & MoveFlags.EnPassantCapture) {
      if (isPieceColor(piece, PieceFlags.White)) this._remove(to + 16);
      else this._remove(to - 16);
    }

    // if it's a promotion move than change to the promotion piece
    if (flags & MoveFlags.Promotion && promotion) {
      this._remove(to);
      this._put(promotion, to);
    }

    // turn off castling if king moves
    if (isPieceType(piece, PieceFlags.King)) {
      // if king castles move the rook
      if (flags & MoveFlags.KingSideCastle) {
        const castlingTo = to - 1;
        const castlingFrom = to + 1;
        this._put(this._board[castlingFrom], castlingTo);
        this._remove(castlingFrom);
      } else if (flags & MoveFlags.QueenSideCastle) {
        const castlingTo = to + 1;
        const castlingFrom = to - 2;
        this._put(this._board[castlingFrom], castlingTo);
        this._remove(castlingFrom);
      }

      this._castling[color] = 0;
    }

    // if the rook moves turn off castling on that side
    if (this._castling[color] && isPieceType(piece, PieceFlags.Rook)) {
      if (isPieceColor(color, PieceFlags.White) && [0x70, 0x77].includes(from)) {
        this._castling[color] ^= from === 0x70 ? MoveFlags.QueenSideCastle : MoveFlags.KingSideCastle;
      } else if ([0x00, 0x07].includes(from)) {
        this._castling[color] ^= from === 0x00 ? MoveFlags.QueenSideCastle : MoveFlags.KingSideCastle;
      }
    }

    // if the rook gets captured turn off castling on that side
    if (this._castling[enemyColor] && captured && isPieceType(captured, PieceFlags.Rook)) {
      if (isPieceColor(captured, PieceFlags.White) && [0x70, 0x77].includes(to)) {
        this._castling[enemyColor] ^= to === 0x70 ? MoveFlags.QueenSideCastle : MoveFlags.KingSideCastle;
      } else if ([0x00, 0x07].includes(to)) {
        this._castling[color] ^= to === 0x00 ? MoveFlags.QueenSideCastle : MoveFlags.KingSideCastle;
      }
    }

    // reset halfmoves if a capture or pawn move or else increment it by 1
    if (flags & (MoveFlags.Capture | MoveFlags.EnPassantCapture) || isPieceType(piece, PieceFlags.Pawn))
      this._halfMoves = 0;
    else this._halfMoves++;

    // increment fullMove during black turn
    if (isPieceColor(piece, PieceFlags.Black)) this._fullMoves++;

    // if big pawn or 2 square pawn move update en-passant square or else set it to null
    if (flags & MoveFlags.BigPawn) this._epSquare = isPieceColor(piece, PieceFlags.White) ? to + 16 : to - 16;
    else this._epSquare = null;

    this._turn = enemyColor;
  }

  // TODO: refine error throwing
  // safely moves the pieces
  public move({ from, to, promotion }: MakeMoveData): Move | never {
    // makes sure from and to square aren't outside the board using 0x88 method
    if (!isValidSquare(from)) throw new Error(ChessErrorCodes.InvalidFromSquare);
    if (!isValidSquare(to)) throw new Error(ChessErrorCodes.InvalidToSquare);

    // generates legal move to check if the move trying to be made is legal or not
    const legalMove = this.generateLegalMoves(from).find(
      (move) => move.from === from && move.to === to && move.promotion === promotion
    );

    if (!legalMove) throw Error(ChessErrorCodes.IllegalMove);

    // ensure if promotion it's a valid piece
    if (promotion && !isValidPromotionPiece(promotion)) throw new Error(ChessErrorCodes.InvalidPromotionPiece);

    // after checking the validility of the move makes the move
    this._makeMove(legalMove);
    this.emit("piecesUpdate", this.pieces());
    this.emit("boardUpdate", [...this._board]);
    this.emit("moveMade", legalMove);

    // returns a the made legal move
    return legalMove;
  }
}

// interface for the event name and corrosponding data required
export interface ChessEvents {
  pieceAdd: [data: PieceTrackData];
  pieceRemove: [data: PieceTrackData];
  boardUpdate: [board: number[]];
  moveMade: [move: Move];
  piecesUpdate: [pieces: PieceTrackData[]];
}

// Chess event listener types
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
