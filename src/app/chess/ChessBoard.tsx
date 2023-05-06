import { useState } from "react";
import Image from "next/image";
import { Chess, PieceTrackData } from "@/scripts/Chess";
import styles from "./ChessBoard.module.css";
import { Piece } from "./Piece";
import EventEmitter from "events";

export interface BoardState {
  boardSize: number;
  boardStyle: "brown" | "green" | "red";
  pieces: PieceTrackData[];
}

export function ChessBoard() {
  const chess = new Chess();
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 600,
    boardStyle: "brown",
    pieces: chess.pieces(),
  });

  const { boardSize, boardStyle, pieces } = boardState;

  chess.on("piecesUpdate", (pieces) => {
    setBoardState((prevState) => ({ ...prevState, pieces }));
    console.log("update");
  });

  return (
    <div style={{ height: boardSize, width: boardSize }} className={styles.board}>
      {pieces.map(({ piece, square }, i) => {
        return <Piece piece={piece} square={square} pieceSize={boardSize / 8} key={i} />;
      })}
    </div>
  );
}
