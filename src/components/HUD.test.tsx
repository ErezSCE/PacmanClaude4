import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HUD } from './HUD';
import { ScoreService } from '../services/ScoreService';
import { GameStateMachine } from '../engine/state/GameStateMachine';

describe('HUD Component', () => {
  let scoreService: ScoreService;
  let gameStateMachine: GameStateMachine;

  beforeEach(() => {
    scoreService = new ScoreService();
    gameStateMachine = new GameStateMachine();
  });

  it('[US-016#1] displays the current score formatted with leading zeros', () => {
    scoreService.addPoints(1234);
    render(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    expect(screen.getByText('001234')).toBeInTheDocument();
  });

  it('[US-016#2] displays exactly 3 lives at game start', () => {
    render(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    const lifeIcons = screen.getAllByLabelText(/Life \d+/);
    expect(lifeIcons).toHaveLength(3);
  });

  it('[US-016#3] updates lives display when lives decrease', () => {
    const { rerender } = render(
      <HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />
    );

    let lifeIcons = screen.getAllByLabelText(/Life \d+/);
    expect(lifeIcons).toHaveLength(3);

    // Simulate losing a life
    gameStateMachine.setLives(2);
    rerender(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    lifeIcons = screen.getAllByLabelText(/Life \d+/);
    expect(lifeIcons).toHaveLength(2);
  });

  it('[US-016#4] displays zero lives when all lives are lost', () => {
    gameStateMachine.setLives(0);
    render(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    const lifeIcons = screen.queryAllByLabelText(/Life \d+/);
    expect(lifeIcons).toHaveLength(0);
  });

  it('displays SCORE label', () => {
    render(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    expect(screen.getByText('SCORE')).toBeInTheDocument();
  });

  it('displays LIVES label', () => {
    render(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    expect(screen.getByText('LIVES')).toBeInTheDocument();
  });

  it('updates score when scoreService emits change', () => {
    const { rerender } = render(
      <HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />
    );

    expect(screen.getByText('000000')).toBeInTheDocument();

    scoreService.addPoints(5000);
    rerender(<HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />);

    expect(screen.getByText('005000')).toBeInTheDocument();
  });

  it('unsubscribes from scoreService on unmount', () => {
    const unsubscribeSpy = vi.spyOn(scoreService, 'unsubscribe');
    const { unmount } = render(
      <HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />
    );

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('unsubscribes from gameStateMachine on unmount', () => {
    const unsubscribeSpy = vi.spyOn(gameStateMachine, 'unsubscribe');
    const { unmount } = render(
      <HUD scoreService={scoreService} gameStateMachine={gameStateMachine} />
    );

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
