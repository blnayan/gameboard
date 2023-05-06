import { PieceTrackData, isDigit } from "./Chess";
import { PieceColorFlags, PieceFlags, PieceTypeFlags, PieceUtil } from "./Piece";

export type FenPieceSymbol = "k" | "p" | "n" | "b" | "r" | "q" | "K" | "P" | "N" | "B" | "R" | "Q";

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

  public static fenSymbolToPiece(symbol: FenPieceSymbol) {
    const symbolToPieceType: { [key: string]: PieceTypeFlags } = {
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

  public static pieceToFenSymbol(piece: number): FenPieceSymbol | null {
    return (
      PieceUtil.isColor(piece, PieceFlags.White)
        ? PieceUtil.getPieceTypeSymbol(piece)!.toUpperCase()
        : PieceUtil.getPieceTypeSymbol(piece)
    ) as FenPieceSymbol | null;
  }

  public static generateBoardFromFen(fen: string) {
    if (!FenUtil.isValidFen(fen)) throw "Invalid FEN";

    const { piecePlacement } = FenUtil.getFenObject(fen);

    const board: number[] = new Array(64).fill(0);
    const pieces: PieceTrackData[] = [];

    let file = 0;
    let rank = 0;

    for (const symbol of piecePlacement) {
      if (symbol === "/") {
        rank++;
        file = 0;
        continue;
      }

      if (isDigit(symbol)) {
        file += parseInt(symbol);
        continue;
      }

      const square = rank * 8 + file;
      const piece = this.fenSymbolToPiece(symbol as FenPieceSymbol);
      board[square] = piece;
      pieces.push({ piece, square });
      file++;
    }

    return { board, pieces };
  }
}
