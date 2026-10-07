import { IpcResult, RequestArgs, RequestChannel, ResponseValue } from '../../common/ipc/Contract';

export default function createRequestHandler<C extends RequestChannel>(
  parse: (args: unknown[]) => RequestArgs<C>,
  handler: (...args: RequestArgs<C>) => Promise<ResponseValue<C>> | ResponseValue<C>,
  reportError: (error: unknown) => void,
) {
  return async (_event: unknown, ...rawArgs: unknown[]): Promise<IpcResult<ResponseValue<C>>> => {
    let args: RequestArgs<C>;
    try {
      args = parse(rawArgs);
    } catch (error) {
      return { ok: false, error: { code: 'INVALID_REQUEST', message: error instanceof Error ? error.message : '잘못된 요청입니다.' } };
    }
    try {
      return { ok: true, value: await handler(...args) };
    } catch (error) {
      reportError(error);
      return { ok: false, error: { code: 'SERVICE_ERROR', message: error instanceof Error ? error.message : '알려지지 않은 오류가 발생했습니다.' } };
    }
  };
}
