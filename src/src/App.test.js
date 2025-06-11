import { render, screen } from '@testing-library/react';
import App from './App';

test('renders journal app', () => {
  render(<App />);
  const editorElement = screen.getByRole('textbox');
  expect(editorElement).toBeInTheDocument();
});
