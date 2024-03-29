import AppDataSource from '../config/AppDataSource';
import CodeMainRepository from '../repository/CodeMainRepository';
import CodeItemRepository from '../repository/CodeItemRepository';
import { ResCodeModel } from '../../common/ResModel';
import { ReqCodeModel } from '../../common/ReqModel';

export default class CodeService {
  private static codeMainRepository = new CodeMainRepository(AppDataSource);

  private static codeItemRepository = new CodeItemRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findAll(): Promise<ResCodeModel[]> {
    const mainList = await this.codeMainRepository.repository.find({
      order: {
        codeMainId: 'ASC',
      },
    });

    const itemList = await this.codeItemRepository.repository.find({
      order: {
        orderNo: 'ASC',
      },
    });

    return mainList.map((codeMain) => {
      const codeItem = itemList.filter((codeItem) => codeItem.codeMainId === codeMain.codeMainId);
      return {
        code: codeMain.codeMainId,
        name: codeMain.name,
        deleteF: codeMain.deleteF,
        subCodeList: codeItem.map((item) => {
          return {
            codeSeq: item.codeItemSeq,
            name: item.name,
            orderNo: item.orderNo,
            deleteF: item.deleteF,
          };
        }),
      };
    });
  }

  static async updateItemOrder(updateInfo: { codeItemSeq: number; orderNo: number }[]) {
    const updatePromises = updateInfo.map((item) =>
      this.codeItemRepository.repository.update({ codeItemSeq: item.codeItemSeq }, { orderNo: item.orderNo }),
    );

    await Promise.all(updatePromises);
  }

  static async saveItem(codeForm: ReqCodeModel) {
    const orderNo = await this.codeItemRepository.getNextOrderNo(codeForm.codeMainId);

    await this.codeItemRepository.repository.save({
      codeMainId: codeForm.codeMainId,
      name: codeForm.name,
      orderNo,
    });
  }

  static async update(codeForm: ReqCodeModel) {
    await this.codeItemRepository.repository.update({ codeItemSeq: codeForm.codeItemSeq }, { name: codeForm.name });
  }

  static async deleteItem(codeItemSeq: number) {
    await this.codeItemRepository.repository.update({ codeItemSeq }, { deleteF: true });
  }
}
