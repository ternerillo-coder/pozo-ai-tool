
// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIChat from './AIChat';
import { chatWithUrologistAI } from '../services/geminiService';

// Mock the geminiService
jest.mock('../services/geminiService', () => ({
  chatWithUrologistAI: jest.fn(),
}));

describe('AIChat Component', () => {
  beforeEach(() => {
    (chatWithUrologistAI as jest.Mock).mockClear();
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test('renders initial state correctly', () => {
    render(<AIChat />);
    expect(screen.getByText(/Hola Dr. Soy su Asistente IA especializado/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Haga una pregunta sobre Urología.../i)).toBeInTheDocument();
  });

  test('handles input change', () => {
    render(<AIChat />);
    const input = screen.getByPlaceholderText(/Haga una pregunta sobre Urología.../i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input.value).toBe('Test message');
  });

  test('sends message on button click and shows response', async () => {
    (chatWithUrologistAI as jest.Mock).mockResolvedValue('Respuesta IA simulada');
    render(<AIChat />);
    
    const input = screen.getByPlaceholderText(/Haga una pregunta sobre Urología.../i);
    const button = screen.getByLabelText(/enviar mensaje/i);

    fireEvent.change(input, { target: { value: 'Consulta médica' } });
    fireEvent.click(button);

    // User message should appear
    expect(screen.getByText('Consulta médica')).toBeInTheDocument();
    
    // Loading state
    expect(screen.getByText(/Consultando base de datos.../i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Wait for response
    await waitFor(() => {
        expect(screen.getByText('Respuesta IA simulada')).toBeInTheDocument();
    });

    // Loading gone
    expect(screen.queryByText(/Consultando base de datos.../i)).not.toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('sends message on Enter key', async () => {
    (chatWithUrologistAI as jest.Mock).mockResolvedValue('Respuesta');
    render(<AIChat />);
    const input = screen.getByPlaceholderText(/Haga una pregunta sobre Urología.../i);
    
    fireEvent.change(input, { target: { value: 'Consulta Enter' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('Consulta Enter')).toBeInTheDocument();
    expect(chatWithUrologistAI).toHaveBeenCalled();
  });

  test('prevents sending empty message', () => {
    render(<AIChat />);
    const button = screen.getByLabelText(/enviar mensaje/i);
    fireEvent.click(button);
    expect(chatWithUrologistAI).not.toHaveBeenCalled();
  });
});
