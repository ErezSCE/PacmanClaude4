import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HUD } from './HUD';
import { ScoreService } from '../services/ScoreService';

describe('HUD Component', () => {
  let scoreService: ScoreService;

  beforeEach(() => {
    scoreService = new ScoreService();
  });

  it('[US-015#1] displays initial score from ScoreService', () => {
    render(<HUD scoreService={scoreService} />);
    
    const scoreValue = screen.getByText('000000');
    expect(scoreValue).toBeInTheDocument();
  });

  it('[US-015#2] updates score display when score changes', () => {
    render(<HUD scoreService={scoreService} />);
    
    // Add 10 points (eating a dot)
    scoreService.addDot();
    
    const scoreValue = screen.getByText('000010');
    expect(scoreValue).toBeInTheDocument();
  });

  it('[US-015#3] updates score display for multiple score changes', () => {
    render(<HUD scoreService={scoreService} />);
    
    // Add 10 points for a dot
    scoreService.addDot();
    
    // Add 50 points for a pellet
    scoreService.addPellet();
    
    const scoreValue = screen.getByText('000060');
    expect(scoreValue).toBeInTheDocument();
  });

  it('[US-015#4] pads score with leading zeros', () => {
    render(<HUD scoreService={scoreService} />);
    
    scoreService.addDot();
    scoreService.addDot();
    scoreService.addDot();
    scoreService.addDot();
    scoreService.addDot(); // 50 points total
    
    const scoreValue = screen.getByText('000050');
    expect(scoreValue).toBeInTheDocument();
  });

  it('[US-015#5] displays score label', () => {
    render(<HUD scoreService={scoreService} />);
    
    const label = screen.getByText('SCORE');
    expect(label).toBeInTheDocument();
  });

  it('[US-015#6] reflects score updates within the same frame', async () => {
    render(<HUD scoreService={scoreService} />);
    
    // Simulate eating a dot
    scoreService.addDot();
    
    // The component should update immediately via the subscription
    const scoreValue = screen.getByText('000010');
    expect(scoreValue).toBeInTheDocument();
  });

  it('[US-015#7] unsubscribes from score changes on unmount', () => {
    const unsubscribeSpy = vi.fn();
    const subscribeSpy = vi.fn(() => unsubscribeSpy);
    scoreService.subscribe = subscribeSpy;
    
    const { unmount } = render(<HUD scoreService={scoreService} />);
    
    unmount();
    
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
