import React from 'react';
import ReactDOM from 'react-dom';
import GameBoard from './game_board';
import styled from 'styled-components';

const AppContainer = styled.div`
  width: 225px;
  margin: 20px auto;
  padding: 20px;
  background: #c0c0c0;

  font-family: monospace;
  font-weight: bold;
`;

ReactDOM.render((
  <AppContainer>
    <GameBoard />
  </AppContainer>
), document.getElementById('root'));
