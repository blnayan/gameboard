import { useState } from "react";
import Image from "next/image";
import { Chess } from "@/scripts/Chess";

interface BoardStates {
  boardSize: number;
  boardStyle: "brown" | "green" | "red";
}

export function ChessBoard() {
  const [boardState, setBoardState] = useState<BoardStates>({
    boardSize: 600,
    boardStyle: "brown",
  });

  const { boardSize, boardStyle } = boardState;

  const chess = new Chess();
  chess.logBoard();

  return (
    <div style={{ height: boardSize, width: boardSize }}>
      <Image
        src={`/board/${boardStyle}.svg`}
        alt={`${boardStyle} chess board`}
        height={boardSize}
        width={boardSize}
        draggable={false}
        priority
      ></Image>
    </div>
  );
}
