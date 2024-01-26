import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import { app } from 'electron';
import { Repository } from 'typeorm';
import AppDataSource, { closeConnection, initConnection } from '../config/AppDataSource';
import Constant from '../../common/Constant';
import DbInitService from './DbInitService';
import AccountRepository from '../repository/AccountRepository';
import BalanceRepository from '../repository/BalanceRepository';
import StockRepository from '../repository/StockRepository';
import StockBuyRepository from '../repository/StockBuyRepository';
import FavoriteRepository from '../repository/FavoriteRepository';
import TransactionRepository from '../repository/TransactionRepository';
import TradeRepository from '../repository/TradeRepository';
import ExchangeRepository from '../repository/ExchangeRepository';
import { Currency, TransactionKind } from '../../common/CommonType';

// 각종 상황을 만들어 가계부 샘플 데이터 입력
export default class SampleDataMakerService {
  private static accountRepository = new AccountRepository(AppDataSource);

  private static balanceRepository = new BalanceRepository(AppDataSource);

  private static stockRepository = new StockRepository(AppDataSource);

  private static stockBuyRepository = new StockBuyRepository(AppDataSource);

  private static favoriteRepository = new FavoriteRepository(AppDataSource);

  private static transactionRepository = new TransactionRepository(AppDataSource);

  private static tradeRepository = new TradeRepository(AppDataSource);

  private static exchangeRepository = new ExchangeRepository(AppDataSource);

  private static readonly START_DATE = new Date(2018, 0, 1);

  static async makeSampleData(backupDbFilePath: string) {
    await closeConnection();
    SampleDataMakerService.backupDb(backupDbFilePath);
    await initConnection();

    // 기본적인 데이터 생성
    await DbInitService.initDbData();

    // 정해진값 넣기
    await this.initAccount();
    await this.initBalance();
    await this.initStock();
    await this.initStockBuy();
    await this.initFavorite();

    // 랜덤함 값 넣기
    await this.insertSampleData();
  }

  private static async insertSampleData() {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const currentDate = new Date(this.START_DATE.getTime());

    while (endDate.getTime() > currentDate.getTime()) {
      // eslint-disable-next-line no-await-in-loop
      await SampleDataMakerService.insertTransaction(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private static async insertTransaction(currentDate: Date) {
    await this.salary(currentDate);
    await this.monthlyRent(currentDate);
    await this.bonus(currentDate);
    await this.interestIncome(currentDate);
    await this.dividendKrw(currentDate);
    await this.dividendUsd(currentDate);
  }

  private static async dividendUsd(currentDate: Date) {
    if (!this.percent(0.005)) {
      return;
    }

    const transactionData = {
      categorySeq: 10,
      kind: TransactionKind.INCOME,
      payAccount: 0,
      receiveAccount: 11,
      attribute: 22,
      currency: Currency.USD,
      amount: this.getRandomInRange(500, 800, 0.01),
      transactionDate: currentDate,
      note: '미국 주식 배당금',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async dividendKrw(currentDate: Date) {
    if (!this.percent(0.008)) {
      return;
    }

    const transactionData = {
      categorySeq: 10,
      kind: TransactionKind.INCOME,
      payAccount: 0,
      receiveAccount: 10,
      attribute: 22,
      currency: Currency.KRW,
      amount: this.getRandomInRange(100_000, 350_000, 1000),
      transactionDate: currentDate,
      note: '배당금',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async interestIncome(currentDate: Date) {
    if (!this.percent(0.01)) {
      return;
    }

    const transactionData = {
      categorySeq: 9,
      kind: TransactionKind.INCOME,
      payAccount: 0,
      receiveAccount: 3,
      attribute: 22,
      currency: Currency.KRW,
      amount: this.getRandomInRange(10_000, 30_000, 500),
      transactionDate: currentDate,
      note: '이자',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async salary(currentDate: Date) {
    // 월급은 25일 받기
    if (currentDate.getDate() !== 25) {
      return;
    }

    const yearDelta = currentDate.getFullYear() - this.START_DATE.getFullYear();

    const transactionData = {
      categorySeq: 3,
      kind: TransactionKind.INCOME,
      payAccount: 0,
      receiveAccount: 3,
      attribute: 20,
      currency: Currency.KRW,
      amount: Math.trunc(2_850_000 * (1 + 0.05 * yearDelta)),
      transactionDate: currentDate,
      note: '월급',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async bonus(currentDate: Date) {
    if (!(currentDate.getMonth() === 11 && currentDate.getDate() === 25)) {
      return;
    }

    const transactionData = {
      categorySeq: 6,
      kind: TransactionKind.INCOME,
      payAccount: 3,
      receiveAccount: 0,
      attribute: 20,
      currency: Currency.KRW,
      amount: Math.trunc(Math.round(3_000_000 * (0.5 + Math.random()))),
      transactionDate: currentDate,
      note: '성과급',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async monthlyRent(currentDate: Date) {
    if (currentDate.getDate() !== 10) {
      return;
    }

    const transactionData = {
      categorySeq: 36,
      kind: TransactionKind.SPENDING,
      payAccount: 2,
      receiveAccount: 0,
      attribute: 19,
      currency: Currency.KRW,
      amount: 700_000,
      transactionDate: currentDate,
      note: '월세',
      fee: 0,
    };
    await this.saveTransaction(transactionData);
  }

  private static async saveTransaction(entityLike: {
    note: string;
    amount: number;
    kind: TransactionKind;
    fee: number;
    categorySeq: number;
    receiveAccount: number;
    currency: Currency;
    attribute: number;
    payAccount: number;
    transactionDate: Date;
  }) {
    const transactionEntity = this.transactionRepository.repository.create(entityLike);
    await this.transactionRepository.repository.save(transactionEntity);
  }

  static async initAccount() {
    await this.initDataFromFile('../assets/sample_data/BA_ACCOUNT.json', this.accountRepository.repository);
  }

  static async initBalance() {
    await this.initDataFromFile('../assets/sample_data/BB_BALANCE.json', this.balanceRepository.repository);
  }

  static async initStock() {
    await this.initDataFromFile('../assets/sample_data/CA_STOCK.json', this.stockRepository.repository);
  }

  static async initStockBuy() {
    await this.initDataFromFile('../assets/sample_data/CB_STOCK_BUY.json', this.stockBuyRepository.repository);
  }

  static async initFavorite() {
    await this.initDataFromFile('../assets/sample_data/BD_FAVORITE.json', this.favoriteRepository.repository);
  }

  static async initDataFromFile(filePath: string, repository: Repository<any>) {
    const dataList = this.loadJson(filePath);
    const promises = dataList.map((data: any) => repository.save(repository.create(data)));
    await Promise.all(promises);
    const count = await repository.count();
    log.info(`총 ${count}개의 ${filePath}가 생성되었습니다.`);
  }

  private static loadJson(paths: string) {
    const filePath = path.join(__dirname, paths);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  private static backupDb(backupDbFilePath: string) {
    const src = path.join(app.getAppPath(), Constant.DB_PATH);
    const dest = path.join(app.getAppPath(), backupDbFilePath);
    const exist = fs.existsSync(src);
    if (!exist) {
      log.error(`DB 파일이 존재하지 않습니다: ${src}`);
      return;
    }
    fs.renameSync(src, dest);
    log.info(`DB 백업 완료: ${backupDbFilePath}`);
  }

  private static getRandomInRange(min: number, max: number, step: number): number {
    return Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
  }

  private static percent(prob: number): boolean {
    if (prob < 0 || prob > 1) {
      throw new Error('Probability must be between 0 and 1 inclusive');
    }
    return Math.random() < prob;
  }
}
