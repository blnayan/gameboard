import {
  Chess,
  ChessErrorCodes,
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
    // makes sure this callback only activates once a piece has been moved
    if (!moved) return;

    // calculates the square (0x88 notation) the piece landed on after the dragging is over
    const toFile = file(square) + Math.round(translateX / pieceSize);
    const toRank = rank(square) + Math.round(translateY / pieceSize);
    const toSquare = toRank * 16 + toFile;

    // // makes sure the piece isn't dropped outside the board or is on the same square from previous, if not reset the dragState
    // if (!isValidSquare(toSquare) || square === toSquare) return resetDragState();

    // // makes sure the move is a legal move, if not reset the dragState
    // if (!legalMoves.find((move) => move.from === square && move.to === toSquare)) return resetDragState();

    // if it's a pawn and the move is on a promotion square then note the toSquare to pieceState and reset the dragState for promotionModal to select promotionPiece and exit function
    if (isPromotionSquare(toSquare) && isPieceType(piece, PieceFlags.Pawn) && !promotionPiece) {
      setPieceState((prevState) => ({ ...prevState, promoting: true, promotionSquare: toSquare }));
      return resetDragState();
    }

    // TODO: more specific error handling
    // if the move fails for any reason reset the dragState
    try {
      chess.move({ from: square, to: toSquare });
    } catch (err) {
      // // make sure it's a Error constructor obj
      // if (!(err instanceof Error)) return resetDragState();

      // return to original dragState because of error
      return resetDragState();
    }
  }, [moved, square, translateX, pieceSize, translateY, piece, promotionPiece, chess]);

  const promotionEffect = useCallback(() => {
    // make sure promotionPiece and promotionSquare both exist before making a promotion move
    if (!promotionPiece || promotionSquare === null) return;

    // if the move fails for any reason reset the pieceState
    // * note that this is never supposed to fail and if it does ever occur that means there is something wrong with the move logic or code
    // * this is just used to make sure the UI looks ok even if the backend logic has errors for any unintended state of the game
    try {
      chess.move({ from: square, to: promotionSquare, promotion: promotionPiece });
    } catch {
      return resetPieceState();
    }
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

  function resetPieceState() {
    setPieceState({
      legalMoves: [],
      promotionPiece: null,
      promoting: false,
      promotionSquare: null,
    });
  }

  // adds the necessary listeners for handling dragging logic
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

    // only left click is allowed
    // makes sure piece color matches the turn color
    // if the game is over don't allow any piece movement
    if (event.button !== 0 || !isPieceColor(piece, chess.turn) || gameOverStatus) return;

    addDraggingListeners();

    setDragState((prevState) => ({
      ...prevState,
      // "event.nativeEvent.offset(X/Y) - pieceSize / 2" makes sure the piece element is centered with the cursor
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
      // "clientY - prevState.clientY" and "clientX - prevState.clientX" calculates the movement in px between the previous and current call back of mousemove event and adds it to the respective translate props
      ...prevState,
      translateX:
        clientX -
        prevState.clientX -
        // makes sure the translation is changed properly when the document clientWidth changes
        (clientWidth - prevState.clientWidth) / 2 -
        // makes sure when the document clientWidth changes to less than or equal to 1100px subtract 224px to offset the UI changes using media queries on translateX
        (prevState.clientWidth > 1100 && clientWidth <= 1100 ? 224 : 0) +
        // makes sure when the document clientWidth changes to more than or equal to 1100px add 224px to offset the UI changes using media queries on translateX
        (prevState.clientWidth <= 1100 && clientWidth > 1100 ? 224 : 0) +
        prevState.translateX,
      translateY: clientY - prevState.clientY + prevState.translateY,
      clientX,
      clientY,
      clientWidth,
      clientHeight,
    }));
  }

  // ends dragging logic
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

  // handles offsets related to scroll
  function handleScroll() {
    const { scrollX, scrollY } = window;
    setDragState((prevState) => ({
      // "scrollX - prevState.scrollX" and "scrollY - prevState.scrollY" calcualtes the movement in px between previous scroll and current scroll and adds the difference to the respective translate props
      ...prevState,
      translateX: scrollX - prevState.scrollX + prevState.translateX,
      translateY: scrollY - prevState.scrollY + prevState.translateY,
      scrollX,
      scrollY,
    }));
  }

  // resets the piece position if window goes out of focus for example switching to another window or switching to another desktop app
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
