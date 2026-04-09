import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MorphemeCard from '../MorphemeCard';

test('displays transaction details correctly', () => {
  // morpheme dict matches what graph.py actually produces:
  // intent_hash, hedera_tx_id, timestamp (unix seconds), risk_score, triage, diagnosis
  const mockMorpheme = {
    intent_hash: '8888777766665555aabbccdd11223344',
    hedera_tx_id: '0.0.12345@1234567890.123456789',
    // Unix seconds timestamp so new Date(ts * 1000) works
    timestamp: 1744000000,
    risk_score: 0.85123,
    triage: 'URGENT',
    diagnosis: 'High likelihood of severe respiratory infection',
    confirmed: true,
    explorer_url: 'https://hashscan.io/testnet/transaction/0.0.12345@1234567890.123456789',
  };

  render(<MorphemeCard morpheme={mockMorpheme} isNew={false} />);

  // TX hash truncated to 20 chars + "..."
  const txElements = screen.getAllByText(/0.0.12345@1234567890/);
  expect(txElements.length).toBeGreaterThanOrEqual(1);

  // Risk score shown as 3 dp — 0.851
  const riskElements = screen.getAllByText(/0\.851/);
  expect(riskElements.length).toBeGreaterThanOrEqual(1);

  // Last 8 chars of intent_hash shown in header
  const hashSliceElements = screen.getAllByText(/11223344/);
  expect(hashSliceElements.length).toBeGreaterThanOrEqual(1);
});

test('displays placeholder when no morpheme is provided', () => {
  render(<MorphemeCard morpheme={null} isNew={false} />);
  // Matches: > UNSEALED — NO MORPHEME COMMITTED
  expect(screen.getByText(/UNSEALED — NO MORPHEME COMMITTED/i)).toBeInTheDocument();
});
