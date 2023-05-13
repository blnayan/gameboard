import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Chess, PieceTrackData } from "@/scripts/Chess";
import styles from "./ChessBoard.module.css";
import { Piece } from "./Piece";

export interface BoardState {
  boardSize: number;
  boardStyle: "brown" | "green" | "red";
  pieceStyle: "alpha" | "cburnett";
  pieces: PieceTrackData[];
  checkMate: boolean;
}

export function ChessBoard() {
  // "7k/P7/8/8/8/8/p7/7K w - - 0 1"
  const [chess] = useState(new Chess());
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 600,
    boardStyle: "brown",
    pieceStyle: "cburnett",
    pieces: [],
    checkMate: false,
  });

  const { boardSize, boardStyle, pieceStyle, pieces, checkMate } = boardState;

  const renderPieces = useCallback(() => {
    return pieces.map(({ piece, square }) => {
      return (
        <Piece
          piece={piece}
          square={square}
          chess={chess}
          pieceSize={boardSize / 8}
          pieceStyle={pieceStyle}
          key={square}
        />
      );
    });
  }, [chess, pieceStyle, pieces, boardSize]);

  const handlePiecesUpdate = useCallback(
    (pieces: PieceTrackData[]) => {
      chess.logBoard();
      setBoardState((prevState) => ({ ...prevState, pieces, checkMate: chess.isCheckmate() }));
    },
    [chess]
  );

  useEffect(() => {
    setBoardState((prevState) => ({ ...prevState, pieces: chess.pieces() }));
    chess.removeListener("piecesUpdate", handlePiecesUpdate);
    chess.on("piecesUpdate", handlePiecesUpdate);
  }, [chess, handlePiecesUpdate]);

  return (
    <>
      <div style={{ height: boardSize, width: boardSize }} className={styles.board}>
        <Image
          src={`${process.env.BASE_PATH ?? ""}/board/${boardStyle}.svg`}
          alt={`${boardStyle.charAt(0).toUpperCase()}${boardStyle.slice(1)} Chess Board`}
          height={boardSize}
          width={boardSize}
          draggable={false}
          priority
        />
        {renderPieces()}
      </div>
      {checkMate ? <p>Check Mate!</p> : false}
    </>
  );
}
