import { PieceSymbol, PieceUtil, algebraic, file, rank } from "@/scripts/Chess";
import Image from "next/image";
import React, { DragEventHandler, useState } from "react";
import styles from "./Piece.module.css";

interface PieceProps {
  piece: number;
  square: number;
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

function isPieceInChessBoard(square: number, translate: DragState["translate"], pieceSize: number) {
  return (
    inBetween(file(square) + Math.round(translate.x / pieceSize), 0, 7) &&
    inBetween(rank(square) + Math.round(translate.y / pieceSize), 0, 7)
  );
}

export function Piece({ piece, square, pieceSize }: PieceProps) {
  const [dragState, setDragState] = useState<DragState>({
    translate: { x: 0, y: 0 },
    scroll: { x: 0, y: 0 },
    dragging: false,
  });

  const { translate, scroll, dragging } = dragState;

  function mountDraggingListeners() {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("blur", handleBlur);
  }

  function unmountDraggingListeners() {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("blur", handleBlur);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.button !== 0) return;
    mountDraggingListeners();
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
    unmountDraggingListeners();
    setDragState((prevState) => {
      // * Logic of figuring out where the piece get's dropped is not right
      console.log(isPieceInChessBoard(square, prevState.translate, pieceSize));
      return {
        ...prevState,
        dragging: false,
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
    unmountDraggingListeners();
    setDragState((prevState) => {
      return {
        ...prevState,
        dragging: false,
      };
    });
  }

  return (
    <div
      style={{
        height: pieceSize,
        width: pieceSize,
        transform: `translate(${translate.x}px, ${translate.y}px)`,
      }}
      // prettier-ignore
      className={[
        styles[algebraic(square)], 
        styles.piece, 
        styles[PieceUtil.getPieceSymbol(piece) as PieceSymbol]
      ].join(" ")}
      onMouseDown={handleMouseDown}
    />
  );
}
