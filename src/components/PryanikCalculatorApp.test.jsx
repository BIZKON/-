import React from 'react';
import { render, screen } from '@testing-library/react';
import PryanikCalculatorApp from './PryanikCalculatorApp';

test('renders calculator app', () => {
  render(<PryanikCalculatorApp />);
  const linkElement = screen.getAllByText(/ПряникПро/i);
  expect(linkElement.length).toBeGreaterThan(0);
});
