import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import { app } from 'electron';
import { Repository } from 'typeorm';
import isDev from 'electron-is-dev';
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
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../../common/CommonType';
import { AccountEntity, StockBuyEntity } from '../entity/Entity';
import SnapshotService from './SnapshotService';
import { ReqSnapshotModel } from '../../common/ReqModel';
import StockBuyService from './StockBuyService';

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

  private static readonly START_DATE = new Date(new Date().getFullYear() - 5, 0, 1, 0, 0, 0, 0);

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

  /* eslint-disable no-await-in-loop */
  private static async insertSampleData() {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const currentDate = new Date(this.START_DATE.getTime());

    while (endDate.getTime() > currentDate.getTime()) {
      await this.insertTransaction(currentDate);
      await this.insertTrade(currentDate);
      await this.insertExchange(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    await this.insertSnapshot();
  }

  private static async insertSnapshot() {
    const stockSellCheckDate = new Date();

    stockSellCheckDate.setMonth(stockSellCheckDate.getMonth() - 3);
    const stockBuys = await StockBuyService.findStockBuyAll();

    const stockEvaluateList = stockBuys
      .filter((stockBuy) => stockBuy.quantity > 0)
      .map((stockBuy) => {
        return {
          stockBuySeq: stockBuy.stockBuySeq,
          buyAmount: stockBuy.buyAmount,
          evaluateAmount: this.getRandomInRange(stockBuy.buyAmount * 0.6, stockBuy.buyAmount * 1.8, 1),
        };
      });

    const reqSnapshotModel = {
      note: '내 자산 평가',
      exchangeRateList: [
        {
          currency: Currency.USD,
          rate: 1258.53,
        },
        {
          currency: Currency.JPY,
          rate: 9.24,
        },
      ],
      stockEvaluateList,
      stockSellCheckDate,
    } as ReqSnapshotModel;

    await SnapshotService.save(reqSnapshotModel);
  }

  private static async insertExchange(currentDate: Date) {
    await this.saveExchange(
      (d: Date) => this.percent(0.007),
      () => this.getRandomInRange(2_000_000, 3_000_000, 100_00),
      () => this.getRandomInRange(2_000, 3_000, 10),
      {
        kind: ExchangeKind.EXCHANGE_BUY,
        account: { accountSeq: 11 } as AccountEntity,
        note: '미장 투자용',
        sellCurrency: Currency.KRW,
        buyCurrency: Currency.USD,
        exchangeDate: currentDate,
      },
    );
    await this.saveExchange(
      (d: Date) => this.percent(0.007),
      () => this.getRandomInRange(2_000, 3_000, 10),
      () => this.getRandomInRange(2_000_000, 3_000_000, 100_00),
      {
        kind: ExchangeKind.EXCHANGE_BUY,
        account: { accountSeq: 11 } as AccountEntity,
        note: '통화 자산 배분',
        sellCurrency: Currency.USD,
        buyCurrency: Currency.KRW,
        exchangeDate: currentDate,
      },
    );
  }

  private static async saveExchange(
    isInsert: (d: Date) => boolean,
    getSellAmount: () => number,
    getBuyAmount: () => number,
    entityLike: {
      kind: ExchangeKind;
      account: AccountEntity;
      note: string;
      sellCurrency: Currency;
      sellAmount?: number;
      buyCurrency: Currency;
      buyAmount?: number;
      fee?: number;
      exchangeDate: Date;
    },
  ) {
    if (!isInsert(entityLike.exchangeDate)) {
      return;
    }
    entityLike.sellAmount = getSellAmount();
    entityLike.buyAmount = getBuyAmount();
    if (entityLike.sellCurrency === Currency.KRW) {
      entityLike.fee = Math.floor(entityLike.sellAmount * 0.0002);
    } else {
      entityLike.fee = Math.floor(entityLike.buyAmount * 0.0002);
    }

    const tradeEntity = this.exchangeRepository.repository.create(entityLike);
    await this.exchangeRepository.repository.save(tradeEntity);
  }

  private static async insertTrade(currentDate: Date) {
    await this.saveTrade(
      (d: Date) => d.getDate() === 1,
      () => this.getRandomInRange(10_000, 20_000, 100),
      () => this.getRandomInRange(20, 30, 1),
      () => 0,
      {
        stockBuy: { stockBuySeq: 1 } as StockBuyEntity,
        note: '매월 적립 매수',
        kind: TradeKind.BUY,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => this.percent(0.005),
      () => this.getRandomInRange(8_000, 20_000, 100),
      () => this.getRandomInRange(50, 80, 1),
      () => this.getRandomInRange(-25, -10, 1),
      {
        stockBuy: { stockBuySeq: 1 } as StockBuyEntity,
        note: '손절 ㅜㅜ',
        kind: TradeKind.SELL,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => this.percent(0.003),
      () => this.getRandomInRange(5_000, 20_000, 50),
      () => this.getRandomInRange(10, 80, 1),
      () => 0,
      {
        stockBuy: { stockBuySeq: 2 } as StockBuyEntity,
        note: '물타기 ㅡㅡ;',
        kind: TradeKind.BUY,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => (d.getMonth() + 1) % 3 === 0 && d.getDate() === 5,
      () => this.getRandomInRange(20_000, 40_000, 5),
      () => 50,
      () => 0,
      {
        stockBuy: { stockBuySeq: 3 } as StockBuyEntity,
        note: '분기별 적립 매수',
        kind: TradeKind.BUY,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => this.percent(0.002),
      () => this.getRandomInRange(25_000, 80_000, 100),
      () => this.getRandomInRange(50, 80, 1),
      () => this.getRandomInRange(10, 50, 1),
      {
        stockBuy: { stockBuySeq: 3 } as StockBuyEntity,
        note: '수익실현 ^^',
        kind: TradeKind.SELL,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => (d.getMonth() + 1) % 6 === 0 && d.getDate() === 10,
      () => this.getRandomInRange(100, 300, 0.01),
      () => this.getRandomInRange(50, 80, 1),
      () => 0,
      {
        stockBuy: { stockBuySeq: 4 } as StockBuyEntity,
        note: '너만 믿는다',
        kind: TradeKind.BUY,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => (d.getMonth() + 1) % 6 === 0 && d.getDate() === 10,
      () => this.getRandomInRange(100, 300, 0.01),
      () => this.getRandomInRange(20, 30, 1),
      () => this.getRandomInRange(-5, 10, 1),
      {
        stockBuy: { stockBuySeq: 4 } as StockBuyEntity,
        note: '자산 배분을 위한 매도',
        kind: TradeKind.SELL,
        tradeDate: currentDate,
      },
    );

    await this.saveTrade(
      (d: Date) => this.percent(0.002),
      () => this.getRandomInRange(80, 500, 0.01),
      () => this.getRandomInRange(30, 85, 1),
      () => 0,
      {
        stockBuy: { stockBuySeq: 6 } as StockBuyEntity,
        note: '복슬라 가즈아',
        kind: TradeKind.BUY,
        tradeDate: currentDate,
      },
    );
  }

  private static async saveTrade(
    isInsert: (d: Date) => boolean,
    getPrice: () => number,
    getQuantity: () => number,
    rateReturn: () => number,
    entityLike: {
      stockBuy: StockBuyEntity;
      note: string;
      kind: TradeKind;
      tradeDate: Date;
      price?: number;
      quantity?: number;
      tax?: number;
      fee?: number;
      sellGains?: number;
    },
  ) {
    if (!isInsert(entityLike.tradeDate)) {
      return;
    }
    entityLike.price = getPrice();
    entityLike.quantity = getQuantity();

    const totalValue = entityLike.price * entityLike.quantity;
    entityLike.fee = Math.floor(totalValue * 0.000039);

    if (entityLike.kind === TradeKind.SELL) {
      entityLike.tax = Math.floor(totalValue * 0.0023);
      entityLike.sellGains = Math.floor((totalValue * rateReturn()) / 100);
    } else {
      entityLike.tax = 0;
      entityLike.sellGains = 0;
    }

    const tradeEntity = this.tradeRepository.repository.create(entityLike);
    await this.tradeRepository.repository.save(tradeEntity);
  }

  private static async insertTransaction(currentDate: Date) {
    // 수입
    await this.saveTransaction(
      (d: Date) => d.getDate() === 25,
      (d: Date) => {
        const yearDelta = d.getFullYear() - this.START_DATE.getFullYear();
        return Math.trunc(2_850_000 * (1 + 0.05 * yearDelta));
      },
      {
        categorySeq: 3,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 3,
        attribute: 20,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '월급',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getMonth() === 11 && d.getDate() === 25,
      (d: Date) => {
        const yearDelta = d.getFullYear() - this.START_DATE.getFullYear();
        return Math.trunc(Math.round(3_000_000 * (0.5 + Math.random())));
      },
      {
        categorySeq: 6,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 3,
        attribute: 20,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '성과급',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.01),
      (d: Date) => this.getRandomInRange(10_000, 30_000, 500),
      {
        categorySeq: 9,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 3,
        attribute: 22,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '이자',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.008),
      (d: Date) => this.getRandomInRange(100_000, 350_000, 1000),
      {
        categorySeq: 10,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 10,
        attribute: 22,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '배당금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.005),
      (d: Date) => this.getRandomInRange(500, 800, 0.01),
      {
        categorySeq: 10,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 11,
        attribute: 22,
        currency: Currency.USD,
        transactionDate: currentDate,
        note: '미국 주식 배당금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.008),
      (d: Date) => this.getRandomInRange(10_000, 100_000, 10_000),
      {
        categorySeq: 17,
        kind: TransactionKind.INCOME,
        payAccount: 0,
        receiveAccount: 1,
        attribute: 21,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '용돈받음',
        fee: 0,
      },
    );

    // 지출
    await this.saveTransaction(
      (d: Date) => d.getDate() === 10,
      (d: Date) => 700_000,
      {
        categorySeq: 36,
        kind: TransactionKind.SPENDING,
        payAccount: 2,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '월세',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.85),
      (d: Date) => 3_800,
      {
        categorySeq: 72,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '전철요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.01),
      (d: Date) => 2_800,
      {
        categorySeq: 72,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '버스요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.005),
      (d: Date) => this.getRandomInRange(6_000, 50_000, 1000),
      {
        categorySeq: 72,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '택시비',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.003),
      (d: Date) => this.getRandomInRange(42_000, 60_000, 2000),
      {
        categorySeq: 72,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '기차요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.003),
      (d: Date) => this.getRandomInRange(30_000, 70_000, 10_000),
      {
        categorySeq: 71,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '기름값',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.035),
      (d: Date) => this.getRandomInRange(35_000, 200_000, 1_500),
      {
        categorySeq: 99,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '술',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.6),
      (d: Date) => this.getRandomInRange(8_000, 20_000, 1_000),
      {
        categorySeq: 31,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '점심',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.05),
      (d: Date) => this.getRandomInRange(10_000, 15_000, 1_000),
      {
        categorySeq: 66,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '영화관람',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.015),
      (d: Date) => this.getRandomInRange(8_000, 35_000, 1_000),
      {
        categorySeq: 69,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '당구',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.004),
      (d: Date) => this.getRandomInRange(2_000, 15_000, 1_000),
      {
        categorySeq: 69,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '입장료',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.00085),
      (d: Date) => this.getRandomInRange(80_000, 150_000, 5_000),
      {
        categorySeq: 66,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '복슬걸즈 콘서트 관람',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.00015),
      (d: Date) => this.getRandomInRange(1_000_000, 2_800_000, 50_000),
      {
        categorySeq: 48,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '노트북',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.002),
      (d: Date) => this.getRandomInRange(30_000, 500_000, 1_000),
      {
        categorySeq: 56,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '병원비',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.01),
      (d: Date) => this.getRandomInRange(5_000, 100_000, 30),
      {
        categorySeq: 55,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '약값',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 20 && this.percent(0.8),
      (d: Date) => 200_000,
      {
        categorySeq: 60,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '피아노 학원비',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 25,
      (d: Date) => 32_500,
      {
        categorySeq: 87,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '보험료',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 10,
      (d: Date) => 25_600,
      {
        categorySeq: 78,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '핸드폰 요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 13,
      (d: Date) => this.getRandomInRange(5_000, 50_000, 1),
      {
        categorySeq: 40,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '전기료',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 13,
      (d: Date) => this.getRandomInRange(10_000, 12_000, 20),
      {
        categorySeq: 41,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '가스요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 12,
      (d: Date) => this.getRandomInRange(8_000, 15_000, 1),
      {
        categorySeq: 39,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '수도요금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 10,
      (d: Date) => this.getRandomInRange(45_000, 60_000, 1000),
      {
        categorySeq: 38,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '아파트 관리비',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.015),
      (d: Date) => this.getRandomInRange(20_000, 150_000, 2000),
      {
        categorySeq: 50,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '옷 구매',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.001),
      (d: Date) => this.getRandomInRange(50_000, 200_000, 10_000),
      {
        categorySeq: 94,
        kind: TransactionKind.SPENDING,
        payAccount: 1,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '축의금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.001),
      (d: Date) => this.getRandomInRange(50_000, 200_000, 10_000),
      {
        categorySeq: 95,
        kind: TransactionKind.SPENDING,
        payAccount: 1,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '조의금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getMonth() === 10 && d.getDate() === 5,
      (d: Date) => 12_000,
      {
        categorySeq: 85,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '주민세',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.0018),
      (d: Date) => this.getRandomInRange(25_000, 45_000, 500),
      {
        categorySeq: 46,
        kind: TransactionKind.SPENDING,
        payAccount: 0,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '후라리팬',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.0005),
      (d: Date) => this.getRandomInRange(1_000, 3_000, 500),
      {
        categorySeq: 47,
        kind: TransactionKind.SPENDING,
        payAccount: 7,
        receiveAccount: 0,
        attribute: 18,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '건전지',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 16,
      (d: Date) => 21_850,
      {
        categorySeq: 79,
        kind: TransactionKind.SPENDING,
        payAccount: 3,
        receiveAccount: 0,
        attribute: 19,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '인터넷 요금',
        fee: 0,
      },
    );

    // 이체
    await this.saveTransaction(
      (d: Date) => d.getDate() === 10,
      (d: Date) => this.getRandomInRange(750_000, 2_500_000, 1),
      {
        categorySeq: 24,
        kind: TransactionKind.TRANSFER,
        payAccount: 3,
        receiveAccount: 7,
        attribute: 17,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '카드값 결제',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 5,
      (d: Date) => 500_000,
      {
        categorySeq: 27,
        kind: TransactionKind.TRANSFER,
        payAccount: 3,
        receiveAccount: 6,
        attribute: 16,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '복슬 펀드',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => d.getDate() === 5,
      (d: Date) => 300_000,
      {
        categorySeq: 26,
        kind: TransactionKind.TRANSFER,
        payAccount: 3,
        receiveAccount: 4,
        attribute: 16,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '복슬 적금',
        fee: 0,
      },
    );

    await this.saveTransaction(
      (d: Date) => this.percent(0.035),
      (d: Date) => this.getRandomInRange(50_000, 300_000, 10_000),
      {
        categorySeq: 21,
        kind: TransactionKind.TRANSFER,
        payAccount: 3,
        receiveAccount: 1,
        attribute: 15,
        currency: Currency.KRW,
        transactionDate: currentDate,
        note: '돈 찾기',
        fee: 0,
      },
    );
  }

  private static async saveTransaction(
    isInsert: (d: Date) => boolean,
    getAmount: (d: Date) => number,
    entityLike: {
      note: string;
      amount?: number;
      kind: TransactionKind;
      fee: number;
      categorySeq: number;
      receiveAccount: number;
      currency: Currency;
      attribute: number;
      payAccount: number;
      transactionDate: Date;
    },
  ) {
    if (!isInsert(entityLike.transactionDate)) {
      return;
    }
    entityLike.amount = getAmount(entityLike.transactionDate);

    const transactionEntity = this.transactionRepository.repository.create(entityLike);
    await this.transactionRepository.repository.save(transactionEntity);
  }

  static async initAccount() {
    await this.initDataFromFile('BA_ACCOUNT.json', this.accountRepository.repository);
  }

  static async initBalance() {
    await this.initDataFromFile('BB_BALANCE.json', this.balanceRepository.repository);
  }

  static async initStock() {
    await this.initDataFromFile('CA_STOCK.json', this.stockRepository.repository);
  }

  static async initStockBuy() {
    await this.initDataFromFile('CB_STOCK_BUY.json', this.stockBuyRepository.repository);
  }

  static async initFavorite() {
    await this.initDataFromFile('BD_FAVORITE.json', this.favoriteRepository.repository);
  }

  static async initDataFromFile(jsonFile: string, repository: Repository<any>) {
    const dataList = this.loadJson(jsonFile);
    const promises = dataList.map((data: any) => repository.save(repository.create(data)));
    await Promise.all(promises);
    const count = await repository.count();
    log.info(`총 ${count}개의 ${jsonFile}가 생성되었습니다.`);
  }

  private static loadJson(jsonFile: string) {
    let filePath;
    if (isDev) {
      filePath = path.join(__dirname, '..', '..', '..', 'assets', 'sample_data', jsonFile);
    } else {
      filePath = path.join(process.resourcesPath, 'assets', 'sample_data', jsonFile);
    }
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
