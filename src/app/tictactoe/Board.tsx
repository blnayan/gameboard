import React, { useEffect, useState } from "react";
import { TicTacToe, Board, Move, Player } from "../../scripts/tictactoe/TicTacToe";

const cellStyle = {
  width: "100px",
  height: "100px",
  border: "1px solid black",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

export const TicTacToeBoard: React.FC = () => {
  const [game, setGame] = useState<TicTacToe>(new TicTacToe());
  const [board, setBoard] = useState<Board>(game.getBoard());
  const [winner, setWinner] = useState<Player | null>(null);
  const [tie, setTie] = useState<boolean>(false);

  useEffect(() => {
    const handleMove = (move: Move) => {
      setBoard(game.getBoard());
    };

    const handleGameOver = (winner: Player) => {
      setWinner(winner);
    };

    const handleTie = () => {
        setTie(true);
      };
  
    game.on("tie", handleTie);
    game.on("move", handleMove);
    game.on("gameOver", handleGameOver);

    return () => {
      game.off("move", handleMove);
      game.off("gameOver", handleGameOver);
      game.off("tie", handleTie);
    };
  }, [game]);

  const handleClick = (row: number, col: number) => {
    game.makeMove(row, col);
  };

  return (
    <div>
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                style={cellStyle}
                onClick={() => handleClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      {winner && (
        <div>
          <h2>{winner} wins!</h2>
        </div>
      )}
      {tie && (
        <div>
          <h2>It's a tie!</h2>
        </div>
      )}
    </div>
  );
};
