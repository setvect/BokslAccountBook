import AppDataSource from '../config/AppDataSource';
import CodeMainRepository from '../repository/CodeMainRepository';
import CodeItemRepository from '../repository/CodeItemRepository';
import { ResCodeModel } from '../../common/ResModel';

export default class CodeService {
  private static codeMainRepository = new CodeMainRepository(AppDataSource);

  private static codeItemRepository = new CodeItemRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findCategoryAll(): Promise<ResCodeModel[]> {
    const mainList = await this.codeMainRepository.repository.find({
      where: {
        deleteF: false,
      },
    });

    const itemList = await this.codeItemRepository.repository.find({
      where: {
        deleteF: false,
      },
      order: {},
    });

    return mainList.map((codeMain) => {
      const codeItem = itemList.filter((codeItem) => codeItem.codeMainId === codeMain.codeMainId);
      return {
        code: codeMain.codeMainId,
        name: codeMain.name,
        subCodeList: codeItem.map((item) => {
          return {
            codeSeq: item.codeItemSeq,
            name: item.name,
            orderNo: item.orderNo,
          };
        }),
      };
    });
  }
}
