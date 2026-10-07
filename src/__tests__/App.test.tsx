/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from '../renderer/App';

jest.mock('../renderer/common/IpcCaller', () => ({ __esModule: true, default: { login: jest.fn().mockResolvedValue(false) } }));

beforeEach(() => {
  window.electron = { ipcRenderer: { request: jest.fn(), on: jest.fn(() => jest.fn()), once: jest.fn(), sendMessage: jest.fn() } };
});

describe('App', () => {
  it('renders the login form', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: '로그인' })).toBeInTheDocument();
  });
});
