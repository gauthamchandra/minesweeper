// @flow

import React from 'react';
import styled from 'styled-components';
import Controls from './controls';
import PlayableSquare from './playable_square'; 
import type { GameConfig, GameState, SquareState, Board } from './types';
import { 
  generateBoard,
  getBoardAsFullyRevealed,
  getNewGameState,
  getUnflaggedMineCount,
  revealSpaceOnBoard,
} from './utils';

type Props = {};
type State = {
  config: GameConfig,
  board: Board,
  gameState: GameState,
};

export default class GameBoard extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.resetGame(true);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { gameState, board } = this.state;

    // if the user lost the game, reveal the entire board
    if (gameState !== prevState.gameState && gameState.lost) {
      this.setState({ board: getBoardAsFullyRevealed(board) });
    }
  };

  resetGame = (syncSet: boolean = false) => {
    const config = {
      width: 9,
      height: 9,
      totalMines: 10,
    };

    const newBoard = generateBoard(config, config.totalMines);
    const gameState = {
      unflaggedMineCount: getUnflaggedMineCount(newBoard),
      lost: false,
      started: false,
      ended: false,
    };

    const changes = {
      config: config,
      board: newBoard,
      gameState, 
    };

    // if game hasn't actually been created and we are in the constructor,
    // then directly set state without using setState. 
    //
    // This is just so that we can reuse some code
    if (syncSet) {
      this.state = changes;
    }
    else {
      this.setState(changes);
    }
  };

  onGameResetRequested = () => {
    this.resetGame();
  };

  onSquareReveal = (rowIndex: number, itemIndex: number) => {
    const { board, gameState } = this.state;
    
    let newBoard = revealSpaceOnBoard(board, rowIndex, itemIndex);
    const square = newBoard[rowIndex][itemIndex];

    this.setState({ 
      board: newBoard,
      gameState: getNewGameState(gameState, newBoard, square),
    });
  }

  onSquareFlagged = (rowIndex: number, itemIndex: number) => {
    const { board, gameState } = this.state;

    let copy = board.slice();

    let square = copy[rowIndex][itemIndex];
    copy[rowIndex][itemIndex] = {
      ...square,
      flagged: !square.flagged,
    };

    this.setState({
      board: copy, 
      gameState: getNewGameState(gameState, copy),
    });
  };

  render() {
    const { config, board, gameState } = this.state;
    const { width, height } = config;

    return (
      <div>
        <Controls 
          gameState={gameState}
          onGameResetRequested={this.onGameResetRequested}
        />

        <GameBoardContainer disabled={gameState.ended}>
          { board.map((row, rowIdx) => (
            <Row key={rowIdx}>
              { row.map((squareConfig, squareIdx) => (
                <PlayableSquare 
                  key={squareIdx}
                  rowIndex={rowIdx}
                  itemIndex={squareIdx}
                  onSquareFlagged={this.onSquareFlagged}
                  onSquareReveal={this.onSquareReveal}
                  flagged={squareConfig.flagged}
                  revealed={squareConfig.revealed}
                  mined={squareConfig.mined}
                  val={squareConfig.val}
                />
              ))}
            </Row>
          ))}
        </GameBoardContainer>
      </div>
    );
  }
}

const GameBoardContainer = styled.div`
  -webkit-box-shadow: inset 0px 0px 5px 0px rgba(255,255,255,1);
  -moz-box-shadow: inset 0px 0px 5px 0px rgba(255,255,255,1);
  box-shadow: inset 0px 0px 5px 0px rgba(255,255,255,1);

  ${props => props.disabled && `
    pointer-events: none;
    opacity: 0.5;
  `}
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
