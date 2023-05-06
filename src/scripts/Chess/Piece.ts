// represented as 8 bits the last 6 represent piece type and first 2 represent piece color
// the reason i used each binary digit to represent a type of piece is to include type safety
// for example if it were 3 bits for type 0b011 represented by 2 Piece types using OR bitwise operator
// with using 6 bits you are safe from that since to represent a piece type you can only have one 1 digit set to 1 everything else has to be false
// this makes it so that when you use OR bitwise operator only color and piece type can be used as operands
export enum PieceFlags {
  None = 0,
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

export class PieceUtil {
  private constructor() {}

  public static getType(piece: number): PieceTypeFlags {
    return piece & PieceFlags.TypeMask;
  }

  public static isType(piece: number, type: PieceTypeFlags) {
    return PieceUtil.getType(piece) === type;
  }

  public static getColor(piece: number): PieceColorFlags {
    return piece & PieceFlags.ColorMask;
  }

  public static isColor(piece: number, color: PieceColorFlags) {
    return PieceUtil.getColor(piece) === color;
  }

  public static getPieceTypeSymbol(piece: number) {
    const pieceTypeToSymbol: { [P in PieceTypeFlags]?: PieceTypeSymbol } = {
      [PieceFlags.King]: "k",
      [PieceFlags.Pawn]: "p",
      [PieceFlags.Knight]: "n",
      [PieceFlags.Bishop]: "b",
      [PieceFlags.Rook]: "r",
      [PieceFlags.Queen]: "q",
    };

    const symbol = pieceTypeToSymbol[PieceUtil.getType(piece)];

    return symbol ?? null;
  }

  public static getPieceColorSymbol(piece: number): PieceColorSymbol | null {
    return PieceUtil.isColor(piece, PieceFlags.White) ? "w" : PieceUtil.isColor(piece, PieceFlags.Black) ? "b" : null;
  }

  public static getPieceSymbol(piece: number): PieceSymbol | null {
    const pieceTypeSymbol = PieceUtil.getPieceTypeSymbol(piece);
    const pieceColorSymbol = PieceUtil.getPieceColorSymbol(piece);

    if (!pieceTypeSymbol || !pieceColorSymbol) return null;

    return `${pieceColorSymbol}${pieceTypeSymbol}`;
  }

  public static getPieceName(piece: number) {
    const pieceTypeSymbol = PieceUtil.getPieceTypeSymbol(piece);
    const pieceColorSymbol = PieceUtil.getPieceColorSymbol(piece);

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
}
