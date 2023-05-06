import React, { CSSProperties, useEffect, useState } from "react";
import { TicTacToe, Player, BotDifficulty, Move } from "@/scripts/tictactoe/TicTacToe";

export const TicTacToeBoard = () => {
    const [game, setGame] = useState<TicTacToe | null>(null);
    const [isPlayingAgainstBot, setIsPlayingAgainstBot] = useState<boolean>(false);
    const [board, setBoard] = useState<Player[][]>([]);
    const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(BotDifficulty.EASY);
  
    useEffect(() => {
      if (game) {
        game.on("move", (move: Move) => {
            setBoard(game.getBoard());
        });
      }
    }, [game, isPlayingAgainstBot]);
  
    const handleClick = (row: number, col: number) => {
      if (game) {
        game.makeMove(row, col);
       
      }
    };

    const handleStartGame = () => {
        setGame(new TicTacToe(isPlayingAgainstBot ? botDifficulty : undefined));
      };
    
      const renderBoard = () => {
        if (!game) return null;
        const board = game.getBoard()
    
        const cellStyle: CSSProperties = {
          width: "50px",
          height: "50px",
          border: "1px solid black",
          textAlign: "center",
          fontSize: "24px",
          lineHeight: "50px"
        };
    
        return (
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
        );
      };
    
      const renderBotSelection = () => {
        return (
          <div>
            <label>
              Play against bot:
              <input
                type="checkbox"
                checked={isPlayingAgainstBot}
                onChange={(e) => setIsPlayingAgainstBot(e.target.checked)}
              />
            </label>
            {isPlayingAgainstBot && (
              <select
                value={botDifficulty}
                onChange={(e) => setBotDifficulty(Number(e.target.value) as BotDifficulty)}
              >
                <option value={BotDifficulty.EASY}>Easy</option>
                <option value={BotDifficulty.MEDIUM}>Medium</option>
                <option value={BotDifficulty.HARD}>Hard</option>
              </select>
            )}
          </div>
        );
      };
    
      return (
        <div>
          {renderBotSelection()}
          <button onClick={handleStartGame}>Start Game</button>
          {renderBoard()}
        </div>
      );
};