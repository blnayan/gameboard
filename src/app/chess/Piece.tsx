import {
  Chess,
  PieceSymbol,
  algebraic,
  file,
  getPieceName,
  getPieceSymbol,
  isValidSquare,
  rank,
} from "@/scripts/Chess";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece.module.css";

interface PieceProps {
  piece: number;
  square: number;
  chess: Chess;
  pieceSize: number;
}

interface DragState {
  translate: { x: number; y: number };
  scroll: { x: number; y: number };
  dragging: boolean;
}

function inBetween(x: number, a: number, b: number) {
  return x >= a && x <= b;
}

export function Piece({ piece, square, chess, pieceSize }: PieceProps) {
  const [dragState, setDragState] = useState<DragState>({
    translate: { x: 0, y: 0 },
    scroll: { x: 0, y: 0 },
    dragging: false,
  });

  const { translate, dragging } = dragState;

  const [moved, setMoved] = useState(false);

  const movedEffect = useCallback(() => {
    if (!moved) return;

    const offsetFile = file(square) + Math.round(translate.x / pieceSize);
    const offsetRank = rank(square) + Math.round(translate.y / pieceSize);
    const translatedSquare = offsetRank * 16 + offsetFile;

    if (!isValidSquare(translatedSquare) || square === translatedSquare) return resetStates();

    chess.remove(square);
    chess.put(piece, translatedSquare);
  }, [moved, translate, square, pieceSize, chess, piece]);

  useEffect(() => {
    movedEffect();
  }, [movedEffect]);

  function resetStates() {
    setDragState({
      translate: { x: 0, y: 0 },
      scroll: { x: 0, y: 0 },
      dragging: false,
    });

    setMoved(false);
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

    addDraggingListeners();

    const { scrollX, scrollY } = window;

    setDragState((prevState) => {
      return {
        ...prevState,
        translate: {
          x: event.nativeEvent.offsetX - pieceSize / 2 + prevState.translate.x,
          y: event.nativeEvent.offsetY - pieceSize / 2 + prevState.translate.y,
        },
        scroll: { x: scrollX, y: scrollY },
        dragging: true,
      };
    });
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
      };
    });

    setMoved(true);
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
    <div
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px)`,
      }}
      // prettier-ignore
      className={[
        styles.piece,
        styles[algebraic(square)], 
        dragging && styles.dragging
      ].join(" ")}
      onMouseDown={handleMouseDown}
    >
      <Image
        src={`/piece/cburnett/${getPieceSymbol(piece) as PieceSymbol}.svg`}
        alt={getPieceName(piece) as string}
        height={pieceSize}
        width={pieceSize}
        draggable={false}
      />
    </div>
  );
}
