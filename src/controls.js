// @flow

import React from 'react';
import styled from 'styled-components';
import type { GameState } from './types';
import { lightGreyBorderColor, darkGreyBorderColor } from './colors'; 
import smileySpritePath from './images/smile_sprite.png';

type Props = {
  gameState: GameState,
  onGameResetRequested: () => void,
}

type State = {
  timerId: IntervalID | null,
  secondsElapsed: number
};

export default class Controls extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { timerId: null, secondsElapsed: 0 };
  }

  componentDidUpdate(prevProps: Props) {
    // if the game started, then start the timer
    if (this.props.gameState.started !== prevProps.gameState.started) {
      this.setState({
        timerId: setInterval(this.timerTick, 1000)
      });
    }
  }

  timerTick = () => {
    const { gameState } = this.props;
    const { timerId, secondsElapsed } = this.state;

    if (gameState.ended) {
      clearInterval(timerId);
      return;
    }

    this.setState({ secondsElapsed: secondsElapsed + 1 });
  }

  onSmileyClick = () => {
    if (this.props.gameState.ended) {
      this.props.onGameResetRequested();
    }
  };

  render() {
    const { secondsElapsed } = this.state;
    const { gameState } = this.props;

    return (
      <ControlBar>
        <span>{gameState.unflaggedMineCount}</span>
        <GameStatusSmilie ended={gameState.ended} lost={gameState.lost} onClick={this.onSmileyClick} />
        <span>{secondsElapsed}</span>
      </ControlBar>
    );
  }
}

const ControlBar = styled.div`
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-top: 2px solid ${darkGreyBorderColor};
  border-left: 2px solid ${darkGreyBorderColor};
  border-right: 2px solid ${lightGreyBorderColor};
  border-bottom: 2px solid ${lightGreyBorderColor};
`;

const GameStatusSmilie = styled.span`
  width: 30px;
  height: 30px;
  background-image: url('${smileySpritePath}');
  background-repeat: no-repeat;
  background-size: 64px;

  ${props => props.lost && `
    background-position: bottom right;
  `}

  ${props => props.ended && !props.lost && `
    background-position: bottom left;
  `}
`;
