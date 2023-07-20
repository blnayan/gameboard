import styles from "./PlayerInfo.module.css";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export function PlayerInfo() {
  return (
    <div className={styles.profileInfoContainer}>
      <div className={styles.flexContainer}>
        <div className={styles.profilePhotoContainer}>
          {
            // Profile Photo
          }
        </div>
        <p>Profile Name</p>
        <p className={`${styles.playerClock} ${robotoMono.className}`}>10:00</p>
      </div>
    </div>
  );
}
