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
import { getBasePath } from "@/scripts";

export interface PieceProps {
  piece: number;
  square: number;
  gameOverStatus: BoardState["gameOverStatus"];
  chess: Chess;
  pieceSize: number;
  pieceStyle: BoardState["pieceStyle"];
}

export interface DragState {
  translateX: number;
  translateY: number;
  clientX: number;
  clientY: number;
  clientWidth: number;
  clientHeight: number;
  scrollX: number;
  scrollY: number;
  dragging: boolean;
  moved: boolean;
}

export interface PieceState {
  legalMoves: Move[];
  promotionPiece: number | null;
  promoting: boolean;
  promotionSquare: number | null;
}

export function Piece({ piece, square, chess, pieceSize, pieceStyle, gameOverStatus }: PieceProps) {
  const [dragState, setDragState] = useState<DragState>({
    translateX: 0,
    translateY: 0,
    clientX: 0,
    clientY: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollX: 0,
    scrollY: 0,
    dragging: false,
    moved: false,
  });

  const { translateX, translateY, dragging, moved } = dragState;

  const [pieceState, setPieceState] = useState<PieceState>({
    legalMoves: [],
    promotionPiece: null,
    promoting: false,
    promotionSquare: null,
  });

  const { legalMoves, promotionPiece, promoting, promotionSquare } = pieceState;

  const movedEffect = useCallback(() => {
    if (!moved) return;

    const toFile = file(square) + Math.round(translateX / pieceSize);
    const toRank = rank(square) + Math.round(translateY / pieceSize);
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
  }, [moved, square, legalMoves, translateX, translateY, pieceSize, piece, promotionPiece, chess]);

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
      translateX: 0,
      translateY: 0,
      clientX: 0,
      clientY: 0,
      clientWidth: 0,
      clientHeight: 0,
      scrollX: 0,
      scrollY: 0,
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
    if (gameOverStatus) return;

    addDraggingListeners();

    setDragState((prevState) => ({
      ...prevState,
      translateX: event.nativeEvent.offsetX - pieceSize / 2 + prevState.translateX,
      translateY: event.nativeEvent.offsetY - pieceSize / 2 + prevState.translateY,
      clientX: event.clientX,
      clientY: event.clientY,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      dragging: true,
    }));

    setPieceState((prevState) => ({
      ...prevState,
      legalMoves: chess.generateLegalMoves(square),
    }));
  }

  function handleMouseMove(event: MouseEvent) {
    event.preventDefault();

    const { clientX, clientY } = event;
    const { clientWidth, clientHeight } = document.documentElement;

    setDragState((prevState) => ({
      ...prevState,
      translateX:
        clientX -
        prevState.clientX -
        (clientWidth - prevState.clientWidth) / 2 -
        (prevState.clientWidth > 1100 && clientWidth <= 1100 ? 224 : 0) +
        (prevState.clientWidth <= 1100 && clientWidth > 1100 ? 224 : 0) +
        prevState.translateX,
      translateY: clientY - prevState.clientY + prevState.translateY,
      clientX,
      clientY,
      clientWidth,
      clientHeight,
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
      translateX: scrollX - prevState.scrollX + prevState.translateX,
      translateY: scrollY - prevState.scrollY + prevState.translateY,
      scrollX,
      scrollY,
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
          transform: `translate(${translateX}px, ${translateY}px)`,
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
          src={`${getBasePath()}/piece/${pieceStyle}/${getPieceSymbol(piece) as PieceSymbol}.svg`}
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
