/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from '../renderer/App';
import IpcRequestError from '../common/ipc/IpcRequestError';
import { showWarnDialog } from '../renderer/components/util/util';

jest.mock('../renderer/components/util/util', () => ({ ...jest.requireActual('../renderer/components/util/util'), showWarnDialog: jest.fn() }));

jest.mock('../renderer/common/IpcCaller', () => ({ __esModule: true, default: { login: jest.fn().mockResolvedValue(false) } }));

beforeEach(() => {
  jest.clearAllMocks();
  window.electron = { ipcRenderer: { request: jest.fn(), on: jest.fn(() => jest.fn()) } };
});

describe('App', () => {
  it('renders the login form', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: '로그인' })).toBeInTheDocument();
  });
});

it('shows an unhandled IPC error once and leaves ordinary errors untouched', () => {
  const { unmount } = render(<App />);
  const ipcEvent = new Event('unhandledrejection', { cancelable: true });
  Object.defineProperty(ipcEvent, 'reason', { value: new IpcRequestError('SERVICE_ERROR', '저장 실패') });
  window.dispatchEvent(ipcEvent);
  expect(ipcEvent.defaultPrevented).toBe(true);
  expect(showWarnDialog).toHaveBeenCalledTimes(1);
  expect(showWarnDialog).toHaveBeenCalledWith('저장 실패');
  const otherEvent = new Event('unhandledrejection', { cancelable: true });
  Object.defineProperty(otherEvent, 'reason', { value: new Error('ordinary error') });
  window.dispatchEvent(otherEvent);
  expect(otherEvent.defaultPrevented).toBe(false);
  unmount();
  const afterUnmount = new Event('unhandledrejection', { cancelable: true });
  Object.defineProperty(afterUnmount, 'reason', { value: new IpcRequestError('SERVICE_ERROR', '저장 실패') });
  window.dispatchEvent(afterUnmount);
  expect(showWarnDialog).toHaveBeenCalledTimes(1);
});
