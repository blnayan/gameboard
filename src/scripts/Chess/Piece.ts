// represented as 8 bits the last 6 represent piece type and first 2 represent piece color
// the reason i used each binary digit to represent a type of piece is to include type safety
// for example if it were 3 bits for type 0b011 represented by 2 Piece types using OR bitwise operator
// with using 6 bits you are safe from that since to represent a piece type you can only have one 1 digit set to 1 everything else has to be false
// this makes it so that when you use OR bitwise operator only color and piece type can be used as operands
export enum PieceFlags {
  King = 0b000001,
  Pawn = 0b000010,
  Knight = 0b000100,
  Bishop = 0b001000,
  Rook = 0b010000,
  Queen = 0b100000,
  White = 0b01000000,
  Black = 0b10000000,
  TypeMask = 0b111111,
  ColorMask = 0b11000000,
}

export type PieceColorFlags = Extract<PieceFlags, PieceFlags.White | PieceFlags.Black>;
export type PieceTypeFlags = Extract<
  PieceFlags,
  PieceFlags.King | PieceFlags.Pawn | PieceFlags.Knight | PieceFlags.Bishop | PieceFlags.Rook | PieceFlags.Queen
>;

export type PieceTypeSymbol = "k" | "p" | "n" | "b" | "r" | "q";
export type PieceColorSymbol = "w" | "b";
export type PieceSymbol = `${PieceColorSymbol}${PieceTypeSymbol}`;

export const pieceList = [65, 66, 68, 72, 80, 96, 129, 130, 132, 136, 144, 160];

export function isValidPiece(piece: number) {
  return pieceList.includes(piece);
}

export function getPieceType(piece: number): PieceTypeFlags {
  return piece & PieceFlags.TypeMask;
}

export function isPieceType(piece: number, type: PieceTypeFlags) {
  return getPieceType(piece) === type;
}

export function getPieceColor(piece: number): PieceColorFlags {
  return piece & PieceFlags.ColorMask;
}

export function isPieceColor(piece: number, color: PieceColorFlags) {
  return getPieceColor(piece) === color;
}

export function getPieceTypeSymbol(piece: number) {
  const pieceTypeToSymbol: { [P in PieceTypeFlags]?: PieceTypeSymbol } = {
    [PieceFlags.King]: "k",
    [PieceFlags.Pawn]: "p",
    [PieceFlags.Knight]: "n",
    [PieceFlags.Bishop]: "b",
    [PieceFlags.Rook]: "r",
    [PieceFlags.Queen]: "q",
  };

  const symbol = pieceTypeToSymbol[getPieceType(piece)];

  return symbol ?? null;
}

export function getPieceColorSymbol(piece: number): PieceColorSymbol | null {
  return isPieceColor(piece, PieceFlags.White) ? "w" : isPieceColor(piece, PieceFlags.Black) ? "b" : null;
}

export function getPieceSymbol(piece: number): PieceSymbol | null {
  const pieceTypeSymbol = getPieceTypeSymbol(piece);
  const pieceColorSymbol = getPieceColorSymbol(piece);

  if (!pieceTypeSymbol || !pieceColorSymbol) return null;

  return `${pieceColorSymbol}${pieceTypeSymbol}`;
}

export function getPieceName(piece: number) {
  const pieceTypeSymbol = getPieceTypeSymbol(piece);
  const pieceColorSymbol = getPieceColorSymbol(piece);

  if (!pieceTypeSymbol || !pieceColorSymbol) return null;

  const colorName: { [C in PieceColorSymbol]: string } = {
    w: "White",
    b: "Black",
  };

  const typeName: { [T in PieceTypeSymbol]: string } = {
    k: "King",
    p: "Pawn",
    n: "Knight",
    b: "Bishop",
    r: "Rook",
    q: "Queen",
  };

  return `${colorName[pieceColorSymbol]} ${typeName[pieceTypeSymbol]}`;
}
