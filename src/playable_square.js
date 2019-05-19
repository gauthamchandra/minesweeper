// @flow

import React from 'react';
import styled from 'styled-components';
import flagPath from './images/flag.png';
import minePath from './images/mine.png';
import { lightGreyBorderColor, darkGreyBorderColor } from './colors';

type Props = {
  rowIndex: number,
  itemIndex: number,
  flagged: boolean,
  mined: boolean,
  revealed: boolean,
  val: ?number,
  onSquareFlagged: (number, number) => void,
  onSquareReveal: (number, number) => void,
};

export default class PlayableSquare extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onSquareFlag = (evt: MouseEvent) => {
    const { rowIndex, itemIndex, revealed, onSquareFlagged } = this.props;

    evt.preventDefault();

    // can't flag a revealed square
    if (revealed) {
      return;
    }
    onSquareFlagged(rowIndex, itemIndex);
  };

  onSquareReveal = (evt: MouseEvent) => {
    const { rowIndex, itemIndex, revealed, flagged, onSquareReveal } = this.props;
    
    // if it's already revealed, then it's noop
    // if its' flagged, then it's also a noop
    if (revealed || flagged) {
      return;
    }
    onSquareReveal(rowIndex, itemIndex);
  }

  render() {
    const { flagged, mined, revealed, val } = this.props;

    let valPriority = {};

    if (val) {
      if (val === 1) {
        valPriority.lowVal = true;
      }
      else if (val > 2) {
        valPriority.mediumVal = true;
      }
      else {
        valPriority.highVal = true;
      }
    }

    return (
      <Square 
        flagged={flagged}
        mined={mined}
        revealed={revealed}
        onContextMenu={this.onSquareFlag} 
        onClick={this.onSquareReveal}
        empty={revealed && !mined && val === 0}
        {...valPriority}
      >
        {revealed && !mined && val !== 0 && val}
      </Square>
    );
  }
}

const Square = styled.span`
  border-left: 2px solid ${lightGreyBorderColor};
  border-top: 2px solid ${lightGreyBorderColor};
  border-right: 2px solid ${darkGreyBorderColor};
  border-bottom: 2px solid ${darkGreyBorderColor};

  height: 25px;
  width: 25px;

  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  text-align: center;

  &:hover {
    cursor: pointer;
  }
  
  // for coloring the numbers
  ${props => props.lowVal && `
    color: blue;
  `}
  ${props => props.mediumVal && `
    color: green;
  `}
  ${props => props.highVal && `
    color: red;
  `}

  // for showing the correct images for mines, flags, etc.
  ${props => props.flagged && `
    background-image: url(${flagPath});
  `}

  ${props => props.mined && props.revealed && `
    background-image: url(${minePath});
  `}

  ${props => props.empty && `
    border: none;
  `}
`;
