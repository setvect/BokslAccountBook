import AppDataSource from '../config/AppDataSource';
import { ResStockBuyModel } from '../../common/ResModel';
import { StockBuyForm } from '../../common/ReqModel';
import StockBuyRepository from '../repository/StockBuyRepository';
import StockRepository from '../repository/StockRepository';
import AccountRepository from '../repository/AccountRepository';
import { StockBuyEntity } from '../entity/Entity';

export default class StockBuyService {
  private static stockBuyRepository = new StockBuyRepository(AppDataSource);

  private static stockRepository = new StockRepository(AppDataSource);

  private static accountRepository = new AccountRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async findStockAll() {
    const stockList = await this.stockBuyRepository.repository.find({
      where: {
        deleteF: false,
      },
    });

    const result = stockList.map(async (stockBuy) => {
      return {
        stockBuySeq: stockBuy.stockBuySeq,
        stockSeq: stockBuy.stock.stockSeq,
        accountSeq: stockBuy.account.accountSeq,
        buyAmount: stockBuy.buyAmount,
        quantity: stockBuy.quantity,
      } as ResStockBuyModel;
    });
    return Promise.all(result);
  }

  static async saveStockBuy(stockBuyForm: StockBuyForm) {
    const stock = await this.stockRepository.repository.findOne({ where: { stockSeq: stockBuyForm.stockSeq } });
    const account = await this.accountRepository.repository.findOne({ where: { accountSeq: stockBuyForm.accountSeq } });

    if (!stock) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const entity: StockBuyEntity = this.stockBuyRepository.repository.create({
      stock,
      account,
      buyAmount: stockBuyForm.buyAmount,
      quantity: stockBuyForm.quantity,
    });
    return this.stockBuyRepository.repository.save(entity);
  }

  static async updateStockBuy(stockBuyForm: StockBuyForm) {
    const beforeData = await this.stockBuyRepository.repository.findOne({ where: { stockBuySeq: stockBuyForm.stockBuySeq } });
    if (!beforeData) {
      throw new Error('수정할 주식 정보를 찾을 수 없습니다.');
    }

    const stock = await this.stockRepository.repository.findOne({ where: { stockSeq: stockBuyForm.stockSeq } });
    const account = await this.accountRepository.repository.findOne({ where: { accountSeq: stockBuyForm.accountSeq } });

    if (!stock) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      stock,
      account,
      buyAmount: stockBuyForm.buyAmount,
      quantity: stockBuyForm.quantity,
    };

    await this.stockBuyRepository.repository.save(updateData);
  }

  static async deleteStockBuy(stockBuySeq: number) {
    const beforeData = await this.stockBuyRepository.repository.findOne({ where: { stockBuySeq } });
    if (!beforeData) {
      throw new Error('종목 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      deleteF: true,
    };

    await this.stockBuyRepository.repository.save(updateData);
  }

  static getStockBuy(accountSeq: number, stockSeq: number) {
    return this.stockBuyRepository.repository.findOne({
      where: {
        account: { accountSeq },
        stock: { stockSeq },
      },
    });
  }
}
