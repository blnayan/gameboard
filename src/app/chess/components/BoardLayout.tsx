import { PlayerInfo } from "./PlayerInfo";
import { ChessBoard } from "./ChessBoard/ChessBoard";
import styles from "./BoardLayout.module.css";
import { useState } from "react";
import { Chess, PieceFlags } from "@/scripts/Chess";

export function BoardLayout() {
  // "7k/PR6/8/8/8/8/pr6/7K w - - 0 1"
  const [chess] = useState(new Chess("7k/PR6/8/8/8/8/pr6/7K w - - 0 1"));

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardLayout}>
        <PlayerInfo chess={chess} color={PieceFlags.Black} />
        <ChessBoard chess={chess} />
        <PlayerInfo chess={chess} color={PieceFlags.White} />
      </div>
      <div className={styles.boardSidebar}>
        <div className={styles.sidebarTitle}>
          <p>Moves</p>
        </div>
      </div>
    </div>
  );
}
