// @flow

import type { GameConfig, SquareState, Board, GameState } from './types';

const mineBoard = (board: Board, totalMines: number) => {
  const rowCount = board.length;
  const colCount = typeof board[0] !== 'undefined' ? board[0].length : 0;
  const totalSpaces = rowCount * colCount; 
  let mineCount = 0;

  // flatten the board first
  const allSquares = board.reduce((arr, row) => {
    return arr.concat(row);
  }, [])

  // now sort it randomly
  allSquares.sort(() => 0.5 - Math.random());

  // and mine the first n items where n = totalMines requested
  for (let i = 0; i < allSquares.length && i < totalMines; i++) {
    allSquares[i].mined = true;
  }
};

export const getUnflaggedMineCount = (board: Board): number => {
  const allSquares = board.reduce((arr, row) => {
    return arr.concat(row);
  }, [])

  let count = 0;
  for (let i = 0; i < allSquares.length; i++) {
    if (allSquares[i].mined && !allSquares[i].flagged) {
      count++;  
    }
  }
  return count;
}

export const generateBoard = (config: GameConfig, totalMines: number) => {
  const { width, height } = config;
  let board = [];

  for (let i = 0; i < width; i++) {
    let row = [];

    for (let j = 0; j < height; j++) {
      row.push({
        flagged: false,
        mined: false,
        revealed: false,
        val: null,
      });
    }

    board.push(row);
  }

  mineBoard(board, totalMines);

  return board;
};

export const getBoardAsFullyRevealed = (board: Board): Board => {
  let copy = board.slice();

  copy.forEach(row => {
    row.forEach(square => {
      square.revealed = true;
    });
  });

  return copy;
};

export const getNewGameState = (
  oldGameState: GameState,
  board: Board,
  lastSquareRevealed?: SquareState
): GameState => {
  if (lastSquareRevealed && lastSquareRevealed.mined) {
    return {
      unflaggedMineCount: oldGameState.unflaggedMineCount - 1,
      lost: true,
      ended: true,
      started: true,
    };
  }

  const unflaggedMineCount = getUnflaggedMineCount(board);

  // if every mine has been flagged, then we won, and we can flag the game as over!
  if (unflaggedMineCount === 0) {
    return {
      unflaggedMineCount,
      lost: false,
      ended: true,
      started: true,
    };
  }
  return {
    ...oldGameState,
    unflaggedMineCount,
    started: true,
  };
};

export const revealSpaceOnBoard = (board: Board, rowIndex: number, itemIndex: number) => {
  const rowCount = board.length;
  const colCount = typeof board[0] !== 'undefined' ? board[0].length : 0;
  let copy: Board = board.slice();

  // if we are out of bounds, then exit out
  if (rowIndex < 0 || itemIndex < 0 || rowIndex >= rowCount || itemIndex >= colCount) {
    return copy;
  }

  let square = copy[rowIndex][itemIndex];

  // if it's an invalid tile, is mined or we have already marked it as revelaed,
  // then exit out
  if (!square || square.mined || square.revealed) {
    return copy;
  }
  
  square.val = calculateValueForSquare(board, rowIndex, itemIndex);

  copy[rowIndex][itemIndex] = {
    ...square,
    revealed: true,
    flagged: false,
  };

  if (square.val === 0) {
    // attempt recursive reveal of all adjacent squares that are also empty 
    copy = revealSpaceOnBoard(copy, rowIndex, itemIndex - 1); // left
    copy = revealSpaceOnBoard(copy, rowIndex, itemIndex + 1); // right
    copy = revealSpaceOnBoard(copy, rowIndex - 1, itemIndex); // top
    copy = revealSpaceOnBoard(copy, rowIndex + 1, itemIndex); // bottom
  }

  return copy;
};

// calculates the number of mines it's adjacent to including diagonals
export const calculateValueForSquare = (board: Board, rowIndex: number, itemIndex: number): number => {
  const rowCount = board.length;
  const colCount = typeof board[0] !== 'undefined' ? board[0].length : 0;
  const square = board[rowIndex][itemIndex]; 
  let mineCount = 0;

  // is there more board to the right
  if (itemIndex + 1 < colCount) {
    // check right
    if (board[rowIndex][itemIndex+1].mined) {
      mineCount++;
    }
    // check top-right
    if (rowIndex - 1 >= 0 && board[rowIndex-1][itemIndex+1].mined) {
      mineCount++;
    }
    // check bottom-right
    if (rowIndex + 1 < rowCount && board[rowIndex+1][itemIndex+1].mined) {
      mineCount++;
    }
  }

  // is there more board to the left?
  if (itemIndex - 1 >= 0) {
    // then check left
    if (board[rowIndex][itemIndex-1].mined) {
      mineCount++;
    }
    // check top-left
    if (rowIndex - 1 >= 0 && board[rowIndex-1][itemIndex-1].mined) {
      mineCount++;
    }
    // check bottom-left
    if (rowIndex + 1 < rowCount && board[rowIndex+1][itemIndex-1].mined) {
      mineCount++;
    }
  }

  // check top 
  if (rowIndex - 1 >= 0 && board[rowIndex-1][itemIndex].mined) {
    mineCount++;
  }
  // and bottom now
  if (rowIndex + 1 < colCount && board[rowIndex+1][itemIndex].mined) {
    mineCount++;
  }

  return mineCount;
};
