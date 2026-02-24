import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Helper component to test useTheme hook
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockClear();
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockClear();
  });

  it('provides default dark theme when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });

  it('toggles from dark to light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    act(() => {
      fireEvent.click(screen.getByText('Toggle'));
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
  });

  it('toggles from light back to dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // dark -> light -> dark
    act(() => {
      fireEvent.click(screen.getByText('Toggle'));
    });
    expect(screen.getByTestId('theme-value').textContent).toBe('light');

    act(() => {
      fireEvent.click(screen.getByText('Toggle'));
    });
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
  });

  it('persists theme to localStorage on toggle', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      fireEvent.click(screen.getByText('Toggle'));
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress React error boundary console output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ThemeConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );

    consoleSpy.mockRestore();
  });
});
