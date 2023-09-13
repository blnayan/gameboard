import { Chess, Color } from "@/scripts/Chess";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";

export interface ChessTimerProps {
  chess: Chess;
  color: Color;
}

export function ChessTimer({ chess, color }: ChessTimerProps) {
  const [milliseconds, setMilliseconds] = useState(10000);
  const [pause, setPause] = useState(color !== chess.turn);

  useEffect(() => {
    // runs every 100 milliseconds to update the UI and logical timer
    const timer = setInterval(() => {
      setMilliseconds((milli) => milli - 100);
    }, 100);

    if (milliseconds <= 0 || pause) clearInterval(timer);

    return () => clearInterval(timer);
  }, [milliseconds, pause]);

  // everytime a move is made the pause state will change from false to true and vice-versa
  const handleMoveMade = useCallback(() => {
    setPause(color !== chess.turn);
  }, [color, chess]);

  useEffect(() => {
    // removeListener makes sure there is double listeners
    chess.removeListener("moveMade", handleMoveMade);
    chess.on("moveMade", handleMoveMade);
  }, [chess, handleMoveMade]);

  // TODO: find out if moment js is faster than using native Date constructor
  return <>{moment(milliseconds).format("mm:ss.S")}</>;
}
