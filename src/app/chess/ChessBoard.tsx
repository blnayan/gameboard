import { useCallback, useEffect, useState } from "react";
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
  const [chess] = useState(new Chess());
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 600,
    boardStyle: "brown",
    pieces: [],
  });

  const { boardSize, boardStyle, pieces } = boardState;

  const renderPieces = useCallback(() => {
    return pieces.map(({ piece, square }) => {
      return <Piece piece={piece} square={square} chess={chess} pieceSize={boardSize / 8} key={square} />;
    });
  }, [chess, pieces, boardSize]);

  useEffect(() => {
    setBoardState((prevState) => ({ ...prevState, pieces: chess.pieces() }));
    chess.removeAllListeners("piecesUpdate");
    chess.on("piecesUpdate", (pieces) => {
      setBoardState((prevState) => ({ ...prevState, pieces }));
      chess.logBoard();
    });
  }, [chess]);

  return (
    <div style={{ height: boardSize, width: boardSize }} className={styles.board}>
      <Image
        src={`/board/${boardStyle}.svg`}
        alt={`${boardStyle.charAt(0).toUpperCase()}${boardStyle.slice(1)} Chess Board`}
        height={boardSize}
        width={boardSize}
        priority
      />
      {renderPieces()}
    </div>
  );
}
