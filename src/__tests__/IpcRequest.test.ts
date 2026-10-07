import { IPC_CHANNEL } from '../common/CommonType';
import { IpcResult } from '../common/ipc/Contract';
import createRequestHandler from '../main/ipc/createRequestHandler';
import { awaitResponse } from '../renderer/common/request';

describe('IPC request lifecycle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns successful results and clears its timer', async () => {
    await expect(awaitResponse(Promise.resolve({ ok: true, value: 42 }))).resolves.toBe(42);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects service failures on the original request', async () => {
    const report = jest.fn();
    const handle = createRequestHandler<IPC_CHANNEL.CallCategoryLoad>(
      () => [],
      () => {
        throw new Error('DB failure');
      },
      report,
    );
    await expect(awaitResponse(handle(null))).rejects.toMatchObject({ code: 'SERVICE_ERROR', message: 'DB failure' });
    expect(report).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects invalid input without calling the service', async () => {
    const service = jest.fn();
    const handle = createRequestHandler<IPC_CHANNEL.CallCategoryLoad>(
      () => {
        throw new Error('invalid');
      },
      service,
      jest.fn(),
    );
    await expect(awaitResponse(handle(null, 'unexpected'))).rejects.toMatchObject({ code: 'INVALID_REQUEST' });
    expect(service).not.toHaveBeenCalled();
  });

  it('times out without retrying and safely consumes a late response', async () => {
    let reply!: (result: IpcResult<number>) => void;
    const response = new Promise<IpcResult<number>>((resolve) => {
      reply = resolve;
    });
    const result = awaitResponse(response, 10);
    // Attach the rejection assertion before advancing the timeout.
    // eslint-disable-next-line jest/valid-expect
    const assertion = expect(result).rejects.toMatchObject({ code: 'TIMEOUT' });
    jest.advanceTimersByTime(10);
    await assertion;
    reply({ ok: true, value: 42 });
    await Promise.resolve();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('keeps concurrent replies independent when they arrive in reverse order', async () => {
    let firstReply!: (value: IpcResult<string>) => void;
    const first = awaitResponse(
      new Promise<IpcResult<string>>((resolve) => {
        firstReply = resolve;
      }),
    );
    const second = awaitResponse(Promise.resolve({ ok: true, value: 'second' }));
    await expect(second).resolves.toBe('second');
    firstReply({ ok: true, value: 'first' });
    await expect(first).resolves.toBe('first');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('normalizes transport errors and clears its timer', async () => {
    await expect(awaitResponse(Promise.reject(new Error('disconnected')))).rejects.toMatchObject({ code: 'TRANSPORT_ERROR' });
    expect(jest.getTimerCount()).toBe(0);
  });
});
