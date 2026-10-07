import { IpcErrorCode } from './Contract';

export default class IpcRequestError extends Error {
  constructor(
    public readonly code: IpcErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'IpcRequestError';
  }
}
