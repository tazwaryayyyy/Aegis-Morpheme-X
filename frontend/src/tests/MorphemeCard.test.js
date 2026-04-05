import { render, screen } from '@testing-library/react';
import MorphemeCard from '../MorphemeCard';

test('displays transaction link correctly', () => {
  const mockMorpheme = {
    hedera_tx_id: '0.0.12345@1234567890.123456789',
    explorer_url: 'https://hashscan.io/testnet/transaction/0.0.12345@1234567890.123456789',
    confirmed: true,
    risk_score: 0.85,
    diagnosis: 'High risk'
  };
  
  render(<MorphemeCard morpheme={mockMorpheme} isNew={true} />);
  
  // Check that the TX ID is displayed
  expect(screen.getByText(/0.0.12345@1234567890.123456789/)).toBeInTheDocument();
  
  // Check that the HashScan link is present and correct
  const link = screen.getByRole('link', { name: /hashscan/i });
  expect(link).toHaveAttribute('href', mockMorpheme.explorer_url);
});

test('displays placeholder when no morpheme is provided', () => {
  render(<MorphemeCard morpheme={null} isNew={false} />);
  expect(screen.getByText(/No Morpheme-X yet/i)).toBeInTheDocument();
});
