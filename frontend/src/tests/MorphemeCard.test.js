import { render, screen } from '@testing-library/react';
import MorphemeCard from '../MorphemeCard';

test('displays transaction details correctly', () => {
  const mockMorpheme = {
    morpheme_id: '8888777766665555',
    hedera_tx_id: '0.0.12345@1234567890.123456789',
    timestamp: '2026-04-05T12:00:00Z',
    data_snapshot: {
      risk_score: 0.85123,
      triage_decision: 'URGENT'
    }
  };
  
  render(<MorphemeCard morpheme={mockMorpheme} isNew={false} />);
  
  // Check shortened TX ID (first 20 chars)
  expect(screen.getByText(/0.0.12345@1234567890/)).toBeInTheDocument();
  
  // Check risk score formatting
  expect(screen.getByText(/0.851/)).toBeInTheDocument();

  // Check morpheme ID slice
  expect(screen.getByText(/66665555/)).toBeInTheDocument();
});

test('displays placeholder when no morpheme is provided', () => {
  render(<MorphemeCard morpheme={null} isNew={false} />);
  // Matches the text: > UNSEALED — NO MORPHEME COMMITTED
  expect(screen.getByText(/UNSEALED — NO MORPHEME COMMITTED/i)).toBeInTheDocument();
});
