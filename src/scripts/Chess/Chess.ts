import { FenUtil } from "./Fen";
import { PieceFlags, PieceUtil } from "./Piece";

export class Chess {
  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.loadFromFen(fen);
  }

  private readonly _board: number[] = [];

  public board() {
    return this._board.map((piece) => {
      // prettier-ignore
      if (!PieceUtil.isType(piece, PieceFlags.None))
        return `${PieceUtil.isColor(piece, PieceFlags.White) ? "w" : "b"}${FenUtil.pieceToFenSymbol(piece)?.toLowerCase()}`;

      return null;
    });
  }

  public logBoard() {
    const board = [...this._board];

    function formatRank(start: number, end: number) {
      return board
        .slice(start, end)
        .map((piece) => FenUtil.pieceToFenSymbol(piece) ?? ".")
        .join("  ");
    }

    const string = `
        +------------------------+
      8 | ${formatRank(0, 8)} |
      7 | ${formatRank(8, 16)} |
      6 | ${formatRank(16, 24)} |
      5 | ${formatRank(24, 32)} |
      4 | ${formatRank(32, 40)} |
      3 | ${formatRank(40, 48)} |
      2 | ${formatRank(48, 56)} |
      1 | ${formatRank(56, 64)} |
        +------------------------+
          a  b  c  d  e  f  g  h
    `;

    console.log(string);
  }

  public loadFromFen(fen: string) {
    this._board.push(...FenUtil.generateBoardFromFen(fen));
  }
}
