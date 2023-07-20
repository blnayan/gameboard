import { PlayerInfo } from "./PlayerInfo";
import { ChessBoard } from "./ChessBoard/ChessBoard";
import styles from "./BoardLayout.module.css";

export function BoardLayout() {
  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardLayout}>
        <PlayerInfo />
        <ChessBoard />
        <PlayerInfo />
      </div>
      <div className={styles.boardSidebar}>
        <div className={styles.sidebarTitle}>
          <p>Moves</p>
        </div>
      </div>
    </div>
  );
}
