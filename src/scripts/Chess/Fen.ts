import { PieceColorFlags, PieceFlags, PieceTypeFlags, PieceUtil } from "./Piece";

export interface FenRegExpMatchArray extends RegExpMatchArray {
  groups: {
    piecePlacement: string;
    sideToMove: string;
    castling: string;
    enPassant: string;
    halfMoveClock: string;
    fullMoveNumber: string;
  };
}

export class FenUtil {
  private constructor() {}

  public static readonly DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  public static readonly FEN_REGEX =
    /^(?<piecePlacement>(([pnbrqkPNBRQK1-8]{1,8})\/?){8})\s+(?<sideToMove>b|w)\s+(?<castling>-|K?Q?k?q)\s+(?<enPassant>-|[a-h][3-6])\s+(?<halfMoveClock>\d+)\s+(?<fullMoveNumber>\d+)\s*$/;

  public static isValidFen(fen: string) {
    return FenUtil.FEN_REGEX.test(fen);
  }

  public static getFenObject(fen: string) {
    const fenMatches = fen.match(FenUtil.FEN_REGEX) as FenRegExpMatchArray;
    return fenMatches?.groups;
  }

  public static fenSymbolToPiece(symbol: string) {
    const symbolToPieceType: { [key: string]: PieceTypeFlags | undefined } = {
      k: PieceFlags.King,
      p: PieceFlags.Pawn,
      n: PieceFlags.Knight,
      b: PieceFlags.Bishop,
      r: PieceFlags.Rook,
      q: PieceFlags.Queen,
    };

    const pieceColor: PieceColorFlags = symbol.toUpperCase() === symbol ? PieceFlags.White : PieceFlags.Black;
    const pieceType = symbolToPieceType[symbol.toLowerCase()] ?? PieceFlags.None;

    return pieceColor | pieceType;
  }

  public static pieceToFenSymbol(piece: number) {
    const pieceTypeToSymbol: { [P in PieceTypeFlags]: string | null } = {
      [PieceFlags.None]: null,
      [PieceFlags.King]: "k",
      [PieceFlags.Pawn]: "p",
      [PieceFlags.Knight]: "n",
      [PieceFlags.Bishop]: "b",
      [PieceFlags.Rook]: "r",
      [PieceFlags.Queen]: "q",
    };

    const symbol = PieceUtil.isColor(piece, PieceFlags.White)
      ? pieceTypeToSymbol[PieceUtil.getType(piece)]?.toUpperCase()
      : pieceTypeToSymbol[PieceUtil.getType(piece)];

    return symbol ?? null;
  }

  public static generateBoardFromFen(fen: string) {
    if (!FenUtil.isValidFen(fen)) throw TypeError("Invalid FEN");

    const { piecePlacement } = FenUtil.getFenObject(fen);

    const board: number[] = new Array(64).fill(0);

    let file = 0;
    let rank = 0;

    for (const symbol of piecePlacement) {
      if (symbol === "/") {
        rank++;
        file = 0;
        continue;
      }

      if (!isNaN(parseInt(symbol))) {
        file += parseInt(symbol);
        continue;
      }

      board[rank * 8 + file] = this.fenSymbolToPiece(symbol);
      file++;
    }

    return board;
  }
}
