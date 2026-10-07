import { IpcResult, RequestArgs, RequestChannel, ResponseValue } from '../../common/ipc/Contract';
import IpcRequestError from '../../common/ipc/IpcRequestError';

// A timeout ends only the UI wait. It never cancels or retries a database write.
export async function awaitResponse<T>(response: Promise<IpcResult<T>>, timeoutMs = 30000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new IpcRequestError('TIMEOUT', '응답 시간이 초과되었습니다. 저장 여부를 확인한 뒤 다시 시도해 주세요.')),
        timeoutMs,
      );
    });
    const result = await Promise.race([response, timeout]);
    if (!result.ok) throw new IpcRequestError(result.error.code, result.error.message);
    return result.value;
  } catch (error) {
    if (error instanceof IpcRequestError) throw error;
    throw new IpcRequestError('TRANSPORT_ERROR', '앱과 통신하지 못했습니다. 다시 실행해 주세요.');
  } finally {
    clearTimeout(timer);
  }
}

export default function request<C extends RequestChannel>(channel: C, ...args: RequestArgs<C>): Promise<ResponseValue<C>> {
  return awaitResponse(window.electron.ipcRenderer.request(channel, ...args));
}
