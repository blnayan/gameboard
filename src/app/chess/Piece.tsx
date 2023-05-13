import {
  Chess,
  Move,
  PieceFlags,
  PieceSymbol,
  algebraic,
  file,
  getPieceName,
  getPieceSymbol,
  isPieceColor,
  isPieceType,
  isPromotionSquare,
  isValidSquare,
  rank,
} from "@/scripts/Chess";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "./Piece.module.css";
import { BoardState } from "./ChessBoard";
import LegalMoves from "./LegalMoves";
import PromotionModal from "./PromotionModal";

export interface PieceProps {
  piece: number;
  square: number;
  chess: Chess;
  pieceSize: number;
  pieceStyle: BoardState["pieceStyle"];
}

export interface DragState {
  translate: { x: number; y: number };
  scroll: { x: number; y: number };
  dragging: boolean;
  moved: boolean;
}

export interface PieceState {
  legalMoves: Move[];
  promotionPiece: number | null;
  promoting: boolean;
  promotionSquare: number | null;
}

export function Piece({ piece, square, chess, pieceSize, pieceStyle }: PieceProps) {
  const [dragState, setDragState] = useState<DragState>({
    translate: { x: 0, y: 0 },
    scroll: { x: 0, y: 0 },
    dragging: false,
    moved: false,
  });

  const { translate, dragging, moved } = dragState;

  const [pieceState, setPieceState] = useState<PieceState>({
    legalMoves: [],
    promotionPiece: null,
    promoting: false,
    promotionSquare: null,
  });

  const { legalMoves, promotionPiece, promoting, promotionSquare } = pieceState;

  const movedEffect = useCallback(() => {
    if (!moved) return;

    const toFile = file(square) + Math.round(translate.x / pieceSize);
    const toRank = rank(square) + Math.round(translate.y / pieceSize);
    const toSquare = toRank * 16 + toFile;

    if (!isValidSquare(toSquare) || square === toSquare) return resetDragState();

    if (!legalMoves.find((move) => move.from === square && move.to === toSquare)) return resetDragState();

    if (isPromotionSquare(toSquare) && isPieceType(piece, PieceFlags.Pawn) && !promotionPiece) {
      setPieceState((prevState) => ({ ...prevState, promoting: true, promotionSquare: toSquare }));
      return resetDragState();
    }

    try {
      chess.move({ from: square, to: toSquare });
    } catch {
      return resetDragState();
    }
  }, [moved, square, legalMoves, translate, pieceSize, piece, promotionPiece, chess]);

  const promotionEffect = useCallback(() => {
    if (!promotionPiece || promotionSquare === null) return;
    chess.move({ from: square, to: promotionSquare, promotion: promotionPiece });
  }, [promotionPiece, promotionSquare, chess, square]);

  useEffect(() => {
    movedEffect();
    promotionEffect();
  }, [movedEffect, promotionEffect]);

  function resetDragState() {
    setDragState({
      translate: { x: 0, y: 0 },
      scroll: { x: 0, y: 0 },
      dragging: false,
      moved: false,
    });
  }

  function addDraggingListeners() {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("blur", handleBlur);
  }

  function removeDraggingListeners() {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("blur", handleBlur);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();

    if (event.button !== 0) return;
    if (!isPieceColor(piece, chess.turn)) return;

    addDraggingListeners();

    const { scrollX, scrollY } = window;

    setDragState((prevState) => ({
      ...prevState,
      translate: {
        x: event.nativeEvent.offsetX - pieceSize / 2 + prevState.translate.x,
        y: event.nativeEvent.offsetY - pieceSize / 2 + prevState.translate.y,
      },
      scroll: { x: scrollX, y: scrollY },
      dragging: true,
    }));

    setPieceState((prevState) => ({
      ...prevState,
      legalMoves: chess.generateLegalMoves(square),
    }));
  }

  function handleMouseMove(event: MouseEvent) {
    event.preventDefault();

    setDragState((prevState) => ({
      ...prevState,
      translate: { x: prevState.translate.x + event.movementX, y: prevState.translate.y + event.movementY },
    }));
  }

  function handleMouseUp(event: MouseEvent) {
    event.preventDefault();
    removeDraggingListeners();

    setDragState((prevState) => {
      return {
        ...prevState,
        dragging: false,
        moved: true,
      };
    });
  }

  function handleScroll() {
    const { scrollX, scrollY } = window;
    setDragState((prevState) => ({
      ...prevState,
      translate: {
        x: scrollX - prevState.scroll.x + prevState.translate.x,
        y: scrollY - prevState.scroll.y + prevState.translate.y,
      },
      scroll: { x: scrollX, y: scrollY },
    }));
  }

  function handleBlur(event: FocusEvent) {
    event.preventDefault();
    removeDraggingListeners();
    setDragState(dragState);
  }

  return (
    <>
      <div
        style={{
          height: pieceSize,
          width: pieceSize,
          transform: `translate(${translate.x}px, ${translate.y}px)`,
        }}
        // prettier-ignore
        className={[
          styles.piece,
          styles[algebraic(square)], 
          (dragging || moved) && styles.dragging
        ].join(" ")}
        onMouseDown={handleMouseDown}
      >
        <Image
          src={`${process.env.BASE_PATH ?? ""}/piece/${pieceStyle}/${getPieceSymbol(piece) as PieceSymbol}.svg`}
          alt={getPieceName(piece) as string}
          height={pieceSize}
          width={pieceSize}
          draggable={false}
        />
      </div>
      {dragging ? <LegalMoves legalMoves={legalMoves} pieceSize={pieceSize} /> : null}
      {isPieceType(piece, PieceFlags.Pawn) ? (
        <PromotionModal
          square={promotionSquare as number}
          piece={piece}
          promoting={promoting}
          setPieceState={setPieceState}
          pieceSize={pieceSize}
          pieceStyle={pieceStyle}
        />
      ) : null}
    </>
  );
}
