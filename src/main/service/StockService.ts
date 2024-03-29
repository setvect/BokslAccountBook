import AppDataSource from '../config/AppDataSource';
import StockRepository from '../repository/StockRepository';
import { ResStockModel } from '../../common/ResModel';
import { ReqStockModel } from '../../common/ReqModel';
import { StockEntity } from '../entity/Entity';
import { Currency } from '../../common/CommonType';

export default class StockService {
  private static stockRepository = new StockRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(stock: StockEntity) {
    return {
      stockSeq: stock.stockSeq,
      name: stock.name,
      currency: stock.currency,
      stockTypeCode: stock.stockTypeCode,
      nationCode: stock.nationCode,
      link: stock.link,
      note: stock.note,
      enableF: stock.enableF,
      deleteF: stock.deleteF,
    } as ResStockModel;
  }

  static async get(stockSeq: number) {
    const stock = await this.stockRepository.repository.findOne({ where: { stockSeq } });
    if (!stock) {
      throw new Error('종목 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(stock);
  }

  static async getStockSeqByCurrency() {
    const stockList = await StockService.findAll();
    const stockSeqByCurrency = new Map<number, Currency>();
    for (const stock of stockList) {
      stockSeqByCurrency.set(stock.stockSeq, stock.currency);
    }
    return stockSeqByCurrency;
  }

  static async findAll() {
    const stockList = await this.stockRepository.repository.find({
      order: { stockSeq: 'ASC' },
    });

    const result = stockList.map(async (stock) => this.mapEntityToRes(stock));
    return Promise.all(result);
  }

  static async save(stockForm: ReqStockModel) {
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

  static async update(stockForm: ReqStockModel) {
    const beforeData = await this.stockRepository.repository.findOne({ where: { stockSeq: stockForm.stockSeq } });
    if (!beforeData) {
      throw new Error('종목 정보를 찾을 수 없습니다.');
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

  static async delete(stockSeq: number) {
    const beforeData = await this.stockRepository.repository.findOne({ where: { stockSeq } });
    if (!beforeData) {
      throw new Error('종목 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      deleteF: true,
    };

    await this.stockRepository.repository.save(updateData);
  }
}
