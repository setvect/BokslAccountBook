import _ from 'lodash';
import moment from 'moment';
import AppDataSource from '../config/AppDataSource';
import TradeRepository from '../repository/TradeRepository';
import { toUTCDate } from '../util';
import TransactionService from './TransactionService';
import { Currency, TransactionKind } from '../../common/CommonType';
import { ReqAssetTrend } from '../../common/ReqModel';
import { ResSellGainsSum, ResTransactionSum } from '../../common/ResModel';
import TradeService from './TradeService';

export default class StatisticService {
  private static tradeRepository = new TradeRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async getAssetTrend(reqAssetTrend: ReqAssetTrend) {
    const from = toUTCDate(reqAssetTrend.startDate);
    const to = toUTCDate(new Date(2100, 0, 1));
    const assetTransactionTrendMap = await this.getAssetTransactionTrendMap(from, to);
    const assetSellGainsTrendMap = await this.getAssetSellGainsTrendMap(from, to);

    const assetTransactionMonthlySumMap = new Map<Currency, Map<Date, number>>();
    const assetTrendMonthlySumMap = new Map<Currency, Map<Date, number>>();

    // 수입 - 지출 월별 합산
    assetTransactionTrendMap.forEach((transactionList, currency) => {
      console.log('transactionList', transactionList);

      _(transactionList)
        .groupBy((transaction) => moment(transaction.transactionDate).format('YYYY-MM-DD'))
        .forEach((transactionListByDate, date) => {
          let monthlyByAmount = assetTransactionMonthlySumMap.get(currency);
          if (!monthlyByAmount) {
            monthlyByAmount = new Map<Date, number>();
          }

          const sum = _.sumBy(transactionListByDate, (transaction) => {
            if (transaction.kind === TransactionKind.INCOME) {
              return transaction.amount - transaction.fee;
            }
            if (transaction.kind === TransactionKind.SPENDING) {
              return -transaction.amount - transaction.fee;
            }
            // 이체는 수수료만 적용
            return -transaction.fee;
          });
          monthlyByAmount.set(new Date(date), sum);

          assetTransactionMonthlySumMap.set(currency, monthlyByAmount);
        });
    });

    // 매도 손익 월별 합산
    assetSellGainsTrendMap.forEach((sellGainsList, currency) => {
      _(sellGainsList)
        .groupBy((sellGains) => moment(sellGains.tradeDate).format('YYYY-MM-DD'))
        .forEach((sellGainsListByDate, date) => {
          let monthlyByAmount = assetTrendMonthlySumMap.get(currency);
          if (!monthlyByAmount) {
            monthlyByAmount = new Map<Date, number>();
          }

          const sum = _.sumBy(sellGainsListByDate, (sellGains) => sellGains.amount - sellGains.tax - sellGains.fee);
          monthlyByAmount.set(new Date(date), sum);

          assetTrendMonthlySumMap.set(currency, monthlyByAmount);
        });
    });

    console.log('assetTransactionTrendMap', assetTransactionTrendMap);
    console.log('assetSellGainsTrendMap', assetSellGainsTrendMap);
    console.log('--------------------------');
    console.log('assetTransactionMonthlySumMap', assetTransactionMonthlySumMap);
    console.log('assetTrendMonthlySumMap', assetTrendMonthlySumMap);
  }

  private static async getAssetSellGainsTrendMap(from: Date, to: Date) {
    const assetSellGainsTrendMap = new Map<Currency, ResSellGainsSum[]>();
    const promise = Object.values(Currency).map(async (currency) => {
      const assetSellGainsTrend = await TradeService.getMonthlySellGainsSum({ from, to, currency });
      assetSellGainsTrendMap.set(currency, assetSellGainsTrend);
    });

    await Promise.all(promise);
    return assetSellGainsTrendMap;
  }

  private static async getAssetTransactionTrendMap(from: Date, to: Date) {
    // 통화별 비동기 작업을 병렬로 수행하고 각각의 결과를 저장할 Map 생성
    const assetTrendMap = new Map<Currency, ResTransactionSum[]>();

    const promises = Object.values(Currency).map(async (currency) => {
      const transactionSums = await TransactionService.getMonthlyAmountSum({ from, to, currency });
      assetTrendMap.set(currency, transactionSums);
    });

    await Promise.all(promises);
    return assetTrendMap;
  }
}
