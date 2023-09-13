import { Chess, Color } from "@/scripts/Chess";
import styles from "./PlayerInfo.module.css";
import { Roboto_Mono } from "next/font/google";
import { ChessTimer } from "./ChessTimer";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export interface PlayerInfoProps {
  chess: Chess;
  color: Color;
}

export function PlayerInfo({ chess, color }: PlayerInfoProps) {
  return (
    <div className={styles.profileInfoContainer}>
      <div className={styles.flexContainer}>
        <div className={styles.profilePhotoContainer}>
          {
            // Profile Photo
          }
        </div>
        <p>Profile Name</p>
        <p className={`${styles.playerClock} ${robotoMono.className}`}>
          <ChessTimer chess={chess} color={color} />
        </p>
      </div>
    </div>
  );
}
