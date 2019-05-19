// @flow

export type GameConfig = {
  width: number,
  height: number,
  totalMines: number,
};

export type SquareState = {
  flagged: boolean,
  mined: boolean,
  revealed: boolean,
  val: ?number,
}

export type GameState = {
  unflaggedMineCount: number,
  lost: boolean,
  started: boolean,
  ended: boolean,
};

export type Board = Array<Array<SquareState>>;
