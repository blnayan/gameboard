import { Move, algebraic } from "@/scripts/Chess";
import styles from "./LegalMoves.module.css";

export interface LegalMovesProps {
  legalMoves: Move[];
  pieceSize: number;
}

export default function LegalMoves({ legalMoves, pieceSize }: LegalMovesProps) {
  return (
    <>
      {legalMoves.map((move, i) => {
        return (
          <div
            style={{ height: pieceSize, width: pieceSize }}
            className={`${styles.legalMove} ${styles[algebraic(move.to)]} ${move.captured ? styles.capture : ""}`}
            key={i}
          />
        );
      })}
    </>
  );
}
