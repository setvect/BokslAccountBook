import * as yup from 'yup';
import log from 'electron-log';
import { ipcMain } from 'electron';
import { IPC_CHANNEL, TransactionKind } from '../../common/CommonType';
import { ReqCategoryModel } from '../../common/ReqModel';
import CategoryService from '../service/CategoryService';
import createRequestHandler from './createRequestHandler';

const categorySchema: yup.ObjectSchema<ReqCategoryModel> = yup.object({
  categorySeq: yup.number().integer().min(0).required(),
  name: yup.string().trim().required('분류 이름을 입력해 주세요.'),
  kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).required(),
  parentSeq: yup.number().integer().min(0).required(),
});
const idSchema = yup.number().integer().positive().required();
const orderSchema = yup
  .array()
  .of(yup.object({ categorySeq: idSchema, orderNo: yup.number().integer().min(0).required() }).required())
  .required();

export function parseCategory(args: unknown[]): [ReqCategoryModel] {
  if (args.length !== 1) throw new Error('분류 요청 인자가 올바르지 않습니다.');
  return [categorySchema.validateSync(args[0], { strict: true })];
}

export default function registerCategoryHandlers() {
  const report = (error: unknown) => log.error('Category request failed', error);
  ipcMain.handle(
    IPC_CHANNEL.CallCategoryLoad,
    createRequestHandler<IPC_CHANNEL.CallCategoryLoad>(
      (args) => {
        if (args.length) throw new Error('조회 인자가 올바르지 않습니다.');
        return [];
      },
      () => CategoryService.findAll(),
      report,
    ),
  );
  ipcMain.handle(
    IPC_CHANNEL.CallCategorySave,
    createRequestHandler<IPC_CHANNEL.CallCategorySave>(parseCategory, (value) => CategoryService.save(value), report),
  );
  ipcMain.handle(
    IPC_CHANNEL.CallCategoryUpdate,
    createRequestHandler<IPC_CHANNEL.CallCategoryUpdate>(parseCategory, (value) => CategoryService.update(value), report),
  );
  ipcMain.handle(
    IPC_CHANNEL.CallCategoryDelete,
    createRequestHandler<IPC_CHANNEL.CallCategoryDelete>(
      (args) => {
        if (args.length !== 1) throw new Error('삭제 인자가 올바르지 않습니다.');
        return [idSchema.validateSync(args[0], { strict: true })];
      },
      (id) => CategoryService.delete(id),
      report,
    ),
  );
  ipcMain.handle(
    IPC_CHANNEL.CallCategoryUpdateOrder,
    createRequestHandler<IPC_CHANNEL.CallCategoryUpdateOrder>(
      (args) => {
        if (args.length !== 1) throw new Error('정렬 인자가 올바르지 않습니다.');
        return [orderSchema.validateSync(args[0], { strict: true })];
      },
      (value) => CategoryService.updateOrder(value),
      report,
    ),
  );
}
