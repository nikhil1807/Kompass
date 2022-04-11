import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import $ from 'jquery';
import swal from 'sweetalert';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

$(window).on("load", function () {
  $(".loader-wrapper").fadeOut("slow");
});

const cols = 6;
const rows = 6;
const maxRetries = 1000;
const goodEnough = 0.9;
const stepTimeout = 250;
const lastStepTimeout = 1000;
const initialSeqLen = 1;
const maxHue = 300;

const GAME_STATE = {
  NOT_STARTED: 'not started',
  COMPUTER_TURN: 'computer’s turn',
  PLAYER_TURN: 'player’s turn'
};

const container = document.getElementById('container');
const startButton = document.getElementById('start');
const status = document.getElementById('status');
const debug = document.getElementById('debug');

const buttons = [];
const game = {
  level: 1,
  state: GAME_STATE.NOT_STARTED,
  seq: [],
  step: 0,
  generationTries: 0,
  generationStart: 0,
  generationEnd: 0
};

const getColor = (x, max) => {
  const normalized = x / max
  return `hsl(${normalized * maxHue}deg 100% 80%)`
}

const rowColToIndex = (row, col) => row * cols + col

const reset = () => {
  game.level = 1;
  game.state = GAME_STATE.NOT_STARTED;
  game.seq = [];
  game.step = 0;
  game.generationTries = 0;
}

const start = (bestseq) => {
  if (!bestseq) game.generationStart = Date.now();
  let tries = 0;
  const newseq = [];
  let index = (Math.floor((rows - 1) / 2) * cols) + Math.floor((cols - 1) / 2);

  game.generationTries++;
  newseq.push(index);
  
  for (let i = 0; i < cols * rows; i++) {
    // next one
    const dir = Math.floor(Math.random() * 4);
    let next
    switch (dir) {
      case 0:
        next = index - cols;
        if (next < 0) {
          next = next + rows * cols;
        }
        break;
      case 1:
        next = index + 1;
        if (next % cols === 0) {
          next -= cols;
        }
        break;
      case 2:
        next = index + cols;
        if (next >= rows * cols) {
          next = next % cols;
        }
        break;
      case 3:
      default:
        next = index - 1;
        if (next < 0 || next % cols === cols - 1) {
          next += cols;
        }
        break;
    }
    if (newseq.includes(next)) {
      i--;
      tries++;
      if (tries > 20) break;
    } else {
      newseq.push(next);
      index = next;
      tries = 0;
    }
  }
  
  if (newseq.length < rows * cols * goodEnough && game.generationTries < maxRetries) {
    start(bestseq && bestseq.length > newseq.length ? bestseq : newseq);
  } else {
    game.seq = bestseq && bestseq.length > newseq.length ? bestseq : newseq;
    game.generationEnd = Date.now();
    game.state = GAME_STATE.COMPUTER_TURN;
    clearBoard();
    render();
    renderStep(0);
  }
}

const mark = (index) => {
  const btnIndex = game.seq[index]
  buttons[btnIndex].innerText = index + 1;
  buttons[btnIndex].style.backgroundColor = getColor(index, game.seq.length);
}

const clearBoard = () => {
  for (let i = 0; i < rows * cols; i++) {
    buttons[i].innerText = '˙';
    buttons[i].style.backgroundColor = 'transparent'; 
  }
}

const render = () => {
  status.innerText = `— \
${game.generationTries} retries — \
${Math.round(100 * game.seq.length / (cols * rows))}% full — \
${game.generationEnd - game.generationStart} ms
`
}

const renderStep = (index) => {
  if (game.level - 1 + initialSeqLen <= index || index >= game.seq.length) {
    setTimeout(() => {
      clearBoard()
      game.state = GAME_STATE.PLAYER_TURN
    }, lastStepTimeout)
    return
  }
  mark(index)
  setTimeout(() => renderStep(index + 1), stepTimeout)
}

const handleStart = () => {
  reset();
  start();
}

const handleClick = (row, col) => {
  if (game.state === GAME_STATE.PLAYER_TURN) {
    if (game.seq[game.step] === rowColToIndex(row, col)) {
      mark(game.step);
      game.step++;
      if (game.step === game.level - 1 + initialSeqLen) {
        if (game.step === game.seq.length) {
          swal("Yay!", "You won!", "success");
          game.state = GAME_STATE.NOT_STARTED;
        } else {
          game.level++;
          game.step = 0;
          game.state = GAME_STATE.COMPUTER_TURN;
          setTimeout(() => {
            clearBoard();
            setTimeout(() => renderStep(0), stepTimeout)
          }, stepTimeout)
        }
      } else {
      }
    } else {
      swal("Oops!", `You lost in level ${game.level}`, "error");
      reset();
    }
  }
}

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const button = document.createElement('button');
    button.addEventListener('click', () => handleClick(i, j))
    container.appendChild(button);
    buttons.push(button);
  }
  container.appendChild(document.createElement('div'));
}

startButton.addEventListener('click', handleStart);
clearBoard();
render();

const loop = () => {
  debug.innerHTML = game.state + ' ' + Date.now();
  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
