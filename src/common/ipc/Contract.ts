import { IPC_CHANNEL } from '../CommonType';
import { ReqCategoryModel } from '../ReqModel';
import { ResCategoryModel } from '../ResModel';

export interface IpcContract {
  [IPC_CHANNEL.CallCategoryLoad]: { args: []; result: ResCategoryModel[] };
  [IPC_CHANNEL.CallCategorySave]: { args: [ReqCategoryModel]; result: void };
  [IPC_CHANNEL.CallCategoryUpdate]: { args: [ReqCategoryModel]; result: void };
  [IPC_CHANNEL.CallCategoryDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallCategoryUpdateOrder]: { args: [{ categorySeq: number; orderNo: number }[]]; result: void };
}

export type RequestChannel = keyof IpcContract;
export type RequestArgs<C extends RequestChannel> = IpcContract[C]['args'];
export type ResponseValue<C extends RequestChannel> = IpcContract[C]['result'];
export type IpcErrorCode = 'INVALID_REQUEST' | 'SERVICE_ERROR' | 'TIMEOUT' | 'TRANSPORT_ERROR';
export type IpcResult<T> = { ok: true; value: T } | { ok: false; error: { code: IpcErrorCode; message: string } };
