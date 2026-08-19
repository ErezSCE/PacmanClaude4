import React, { useReducer, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import TouchControls from './components/TouchControls';
import StartScreen from './components/screens/StartScreen';
import CountdownScreen from './components/screens/CountdownScreen';
import PauseOverlay from './components/screens/PauseOverlay';
import LevelCompleteScreen from './components/screens/LevelCompleteScreen';
import GameOverScreen from './components/screens/GameOverScreen';
import { GameStateMachine, type GameScreen } from './engine/state/GameStateMachine';
import { GameLoop, createGameLoop } from './engine/GameLoop';
import { InputManager } from './input/InputManager';
import { AudioManager } from './audio/AudioManager';
import { ScoreService } from './services/ScoreService';

interface GameState {
  screen: GameScreen;
  level: number;
  score: number;
  lives: number;
  isPaused: boolean;
}

type GameAction =
  | { type: 'SET_SCREEN'; payload: GameScreen }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'SET_LIVES'; payload: number }
  | { type: 'SET_PAUSED'; payload: boolean };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'SET_LIVES':
      return { ...state, lives: action.payload };
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    default:
      return state;
  }
}

function App() {
  const [gameState, dispatch] = useReducer(gameReducer, {
    screen: 'start',
    level: 1,
    score: 0,
    lives: 3,
    isPaused: false,
  });

  const gameLoopRef = useRef<GameLoop | null>(null);
  const stateMachineRef = useRef<GameStateMachine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const scoreServiceRef = useRef<ScoreService | null>(null);

  useEffect(() => {
    // Initialize services
    audioManagerRef.current = new AudioManager();
    scoreServiceRef.current = new ScoreService();
    inputManagerRef.current = new InputManager();
    stateMachineRef.current = new GameStateMachine();
    gameLoopRef.current = createGameLoop(
      stateMachineRef.current,
      audioManagerRef.current,
      scoreServiceRef.current,
    );

    // Subscribe to state machine changes
    const unsubscribe = stateMachineRef.current.subscribe((newScreen) => {
      dispatch({ type: 'SET_SCREEN', payload: newScreen });
    });

    return () => {
      unsubscribe();
      gameLoopRef.current?.stop();
    };
  }, []);

  const handleStartGame = () => {
    if (stateMachineRef.current) {
      stateMachineRef.current.transitionTo('countdown');
    }
  };

  const handlePause = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.pause();
      dispatch({ type: 'SET_PAUSED', payload: true });
    }
  };

  const handleResume = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.resume();
      dispatch({ type: 'SET_PAUSED', payload: false });
    }
  };

  const handleGameOver = () => {
    if (stateMachineRef.current) {
      stateMachineRef.current.transitionTo('gameOver');
    }
  };

  const handleNextLevel = () => {
    if (stateMachineRef.current) {
      stateMachineRef.current.transitionTo('countdown');
    }
  };

  return (
    <div className="app">
      <GameCanvas gameLoop={gameLoopRef.current} />
      <HUD score={gameState.score} lives={gameState.lives} level={gameState.level} />
      <TouchControls />

      {gameState.screen === 'start' && <StartScreen onStart={handleStartGame} />}
      {gameState.screen === 'countdown' && <CountdownScreen />}
      {gameState.screen === 'playing' && gameState.isPaused && (
        <PauseOverlay onResume={handleResume} />
      )}
      {gameState.screen === 'levelComplete' && (
        <LevelCompleteScreen level={gameState.level} onComplete={handleNextLevel} />
      )}
      {gameState.screen === 'gameOver' && <GameOverScreen />}
    </div>
  );
}

export default App;
