import AppDataSource from '../config/AppDataSource';
import StockRepository from '../repository/StockRepository';
import { ResStockModel } from '../../common/ResModel';
import { StockForm } from '../../common/ReqModel';

export default class StockService {
  private static stockRepository = new StockRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findStockAll() {
    const stockList = await this.stockRepository.repository.find({
      where: {
        deleteF: false,
      },
    });

    const result = stockList.map(async (stock) => {
      return {
        stockSeq: stock.stockSeq,
        name: stock.name,
        currency: stock.currency,
        stockTypeCode: stock.stockTypeCode,
        nationCode: stock.nationCode,
        link: stock.link,
        note: stock.note,
        enableF: stock.enableF,
      } as ResStockModel;
    });
    return Promise.all(result);
  }

  static async saveStock(stockForm: StockForm) {
    const entity = this.stockRepository.repository.create({
      name: stockForm.name,
      currency: stockForm.currency,
      stockTypeCode: stockForm.stockTypeCode,
      nationCode: stockForm.nationCode,
      link: stockForm.link,
      note: stockForm.note,
      enableF: stockForm.enableF,
    });
    await this.stockRepository.repository.save(entity);
  }

  static async updateStock(stockForm: StockForm) {
    const beforeData = await this.stockRepository.repository.findOne({ where: { stockSeq: stockForm.stockSeq } });
    if (!beforeData) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      name: stockForm.name,
      currency: stockForm.currency,
      stockTypeCode: stockForm.stockTypeCode,
      nationCode: stockForm.nationCode,
      link: stockForm.link,
      note: stockForm.note,
      enableF: stockForm.enableF,
    };

    await this.stockRepository.repository.save(updateData);
  }
}
