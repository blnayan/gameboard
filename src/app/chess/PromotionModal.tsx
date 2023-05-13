import { PieceFlags, algebraic, isPieceColor, rank } from "@/scripts/Chess";
import styles from "./PromotionModal.module.css";
import { PieceState } from "./Piece";
import Image from "next/image";
import { BoardState } from "./ChessBoard";
import { getPieceName, getPieceSymbol, isPieceType } from "../../scripts/Chess/Piece";
import { useEffect, useRef } from "react";

export interface PromotionModalProps {
  square: number;
  piece: number;
  promoting: boolean;
  setPieceState: React.Dispatch<React.SetStateAction<PieceState>>;
  pieceSize: number;
  pieceStyle: BoardState["pieceStyle"];
}

const PROMOTION_PIECES = [PieceFlags.Queen, PieceFlags.Rook, PieceFlags.Bishop, PieceFlags.Knight];

export default function PromotionModal({
  square,
  piece,
  promoting,
  setPieceState,
  pieceSize,
  pieceStyle,
}: PromotionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node))
        setPieceState((prevState) => ({ ...prevState, promoting: false }));
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dialogRef, setPieceState]);

  return (
    <dialog
      ref={dialogRef}
      open={promoting}
      style={{ height: pieceSize * 4, width: pieceSize }}
      className={[styles.promotionModal, styles[algebraic(square)]].join(" ")}
    >
      {PROMOTION_PIECES.map((type, i) => {
        const promotionPiece = isPieceColor(piece, PieceFlags.White)
          ? PieceFlags.White | type
          : PieceFlags.Black | type;

        return (
          <div
            className={styles.promotionPiece}
            key={i}
            style={{
              height: pieceSize,
              width: pieceSize,
              [isPieceColor(piece, PieceFlags.White) ? "top" : "bottom"]: `${i * pieceSize}px`,
            }}
            onMouseDown={() => setPieceState((prevState) => ({ ...prevState, promotionPiece }))}
          >
            <Image
              src={`/piece/${pieceStyle}/${getPieceSymbol(promotionPiece)}.svg`}
              alt={getPieceName(promotionPiece) as string}
              height={pieceSize}
              width={pieceSize}
              draggable={false}
            />
          </div>
        );
      })}
    </dialog>
  );
}
