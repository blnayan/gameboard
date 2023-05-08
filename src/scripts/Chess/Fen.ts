import { PieceColorFlags, PieceFlags, PieceTypeFlags, getPieceTypeSymbol, isPieceColor } from "./Piece";

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

export const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const FEN_REGEX =
  /^(?<piecePlacement>(([pnbrqkPNBRQK1-8]{1,8})\/?){8})\s+(?<sideToMove>b|w)\s+(?<castling>-|K?Q?k?q)\s+(?<enPassant>-|[a-h][3-6])\s+(?<halfMoveClock>\d+)\s+(?<fullMoveNumber>\d+)\s*$/;

export function isValidFen(fen: string) {
  return FEN_REGEX.test(fen);
}

export function getFenObject(fen: string) {
  const fenMatches = fen.match(FEN_REGEX) as FenRegExpMatchArray;
  return fenMatches?.groups;
}

export function fenSymbolToPiece(symbol: FenPieceSymbol) {
  const symbolToPieceType: { [key: string]: PieceTypeFlags } = {
    k: PieceFlags.King,
    p: PieceFlags.Pawn,
    n: PieceFlags.Knight,
    b: PieceFlags.Bishop,
    r: PieceFlags.Rook,
    q: PieceFlags.Queen,
  };

  const pieceColor: PieceColorFlags = symbol.toUpperCase() === symbol ? PieceFlags.White : PieceFlags.Black;
  const pieceType = symbolToPieceType[symbol.toLowerCase()];

  return pieceColor | pieceType;
}

export function pieceToFenSymbol(piece: number): FenPieceSymbol | null {
  return (
    isPieceColor(piece, PieceFlags.White) ? getPieceTypeSymbol(piece)!.toUpperCase() : getPieceTypeSymbol(piece)
  ) as FenPieceSymbol | null;
}
