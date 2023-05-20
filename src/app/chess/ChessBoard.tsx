import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Chess, PieceTrackData } from "@/scripts/Chess";
import styles from "./ChessBoard.module.css";
import { Piece } from "./Piece";
import { getBasePath } from "@/scripts";

export interface BoardState {
  boardSize: number;
  boardStyle: "brown" | "green" | "red";
  pieceStyle: "alpha" | "cburnett";
  pieces: PieceTrackData[];
  gameOverStatus?: "draw" | "checkmate";
}

export function ChessBoard() {
  // "7k/P7/8/8/8/8/p7/7K w - - 0 1"
  const [chess] = useState(new Chess());
  const [boardState, setBoardState] = useState<BoardState>({
    boardSize: 600,
    boardStyle: "brown",
    pieceStyle: "cburnett",
    pieces: [],
  });

  const { boardSize, boardStyle, pieceStyle, pieces, gameOverStatus } = boardState;

  const renderPieces = useCallback(() => {
    return pieces.map(({ piece, square }) => {
      return (
        <Piece
          piece={piece}
          square={square}
          gameOverStatus={gameOverStatus}
          chess={chess}
          pieceSize={boardSize / 8}
          pieceStyle={pieceStyle}
          key={square}
        />
      );
    });
  }, [chess, pieceStyle, pieces, boardSize, gameOverStatus]);

  const handlePiecesUpdate = useCallback(
    (pieces: PieceTrackData[]) => {
      chess.logBoard();
      setBoardState((prevState) => ({
        ...prevState,
        pieces,
        gameOverStatus: chess.isDraw() ? "draw" : chess.isCheckmate() ? "checkmate" : undefined,
      }));
    },
    [chess]
  );

  useEffect(() => {
    setBoardState((prevState) => ({
      ...prevState,
      pieces: chess.pieces(),
      gameOverStatus: chess.isDraw() ? "draw" : chess.isCheckmate() ? "checkmate" : undefined,
    }));
    chess.removeListener("piecesUpdate", handlePiecesUpdate);
    chess.on("piecesUpdate", handlePiecesUpdate);
  }, [chess, handlePiecesUpdate]);

  return (
    <>
      <div style={{ height: boardSize, width: boardSize }} className={styles.board}>
        <Image
          className={styles.boardImage}
          src={`${getBasePath()}/board/${boardStyle}.svg`}
          alt={`${boardStyle.charAt(0).toUpperCase()}${boardStyle.slice(1)} Chess Board`}
          height={boardSize}
          width={boardSize}
          draggable={false}
          priority
        />
        {renderPieces()}
      </div>
      <p>{gameOverStatus ?? null}</p>
    </>
  );
}
