import _ from 'lodash';
import moment from 'moment';
import { toUTCDate } from '../util';
import TransactionService from './TransactionService';
import { Currency, CurrencyAmountModel, ExchangeRateModel, TransactionKind } from '../../common/CommonType';
import { ReqAssetTrend } from '../../common/ReqModel';
import { ResAssetTrend, ResSellGainsSum, ResTransactionSum } from '../../common/ResModel';
import TradeService from './TradeService';
import AccountService from './AccountService';
import StockBuyService from './StockBuyService';
import StockService from './StockService';

// Key: yyyy-MM-dd
type DateMap = Map<string, number>;

export default class StatisticService {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  static async getAssetTrend(reqAssetTrend: ReqAssetTrend) {
    const from = toUTCDate(reqAssetTrend.startDate);
    const to = toUTCDate(new Date(2100, 0, 1));

    const totalBalance = await this.getTotalBalance(reqAssetTrend);

    const assetTrendMap = await this.calculateAssetTrend(from, to, reqAssetTrend);

    // Map을 배열로 변환하고, 배열을 키(key)에 따라 정렬
    let start: Date;
    let end: Date;
    if (assetTrendMap.size === 0) {
      start = reqAssetTrend.startDate;
      end = new Date();
    } else {
      const range = this.getStartAndEndDate(assetTrendMap);
      start = range.start;
      end = range.end;
    }

    const currentDate = new Date(start);
    let currentBalance = totalBalance - _.sum(Array.from(assetTrendMap.values()));

    // 최초 잔고를 추가
    const initDate = new Date(currentDate);
    initDate.setMonth(currentDate.getMonth() - 1);
    const result: ResAssetTrend[] = [{ tradeDate: initDate, amount: currentBalance }];

    while (currentDate <= end) {
      currentBalance += assetTrendMap.get(moment(currentDate).format('YYYY-MM-DD')) || 0;
      result.push({ tradeDate: new Date(currentDate), amount: currentBalance });

      // 현재 날짜에 1개월을 추가
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return result;
  }

  private static getStartAndEndDate(combinedMap: Map<string, number>) {
    const sortedEntries: [string, number][] = _.sortBy(Array.from(combinedMap.entries()), [0]);
    const start = new Date(sortedEntries[0][0]);
    const end = new Date(sortedEntries[sortedEntries.length - 1][0]);
    return { start, end };
  }

  // 수입, 지출, 매도 손익을 통화별 월별 합산
  // <'YYYY-MM-DD', 해당 날짜의 자산 증감> 형태로 변환
  private static async calculateAssetTrend(from: Date, to: Date, reqAssetTrend: ReqAssetTrend) {
    const assetTransactionSumByCurrency = await this.getAssetTransactionTrendMap(from, to);
    const assetTrendMonthlySumByCurrency = await this.getAssetSellGainsTrendMap(from, to);

    // 환율 적용해 원화로 계산
    // <Date, number> 형태로 변환
    const assetTransactionMonthlySum: DateMap = new Map<string, number>();
    assetTransactionSumByCurrency.forEach((monthlyByAmount, currency) => {
      monthlyByAmount.forEach((amount, date) => {
        const rate = this.getRate(reqAssetTrend.exchangeRate, currency);
        const sum = assetTransactionMonthlySum.get(date) || 0;
        assetTransactionMonthlySum.set(date, sum + amount * rate);
      });
    });

    const assetTradeMonthlySum: DateMap = new Map<string, number>();
    assetTrendMonthlySumByCurrency.forEach((monthlyByAmount, currency) => {
      monthlyByAmount.forEach((amount, date) => {
        const rate = this.getRate(reqAssetTrend.exchangeRate, currency);
        const sum = assetTradeMonthlySum.get(date) || 0;
        assetTradeMonthlySum.set(date, sum + amount * rate);
      });
    });

    const combinedMap: DateMap = new Map<string, number>();
    // 첫 번째 Map 순회
    assetTransactionMonthlySum.forEach((value, key) => {
      combinedMap.set(moment(key).format('YYYY-MM-DD'), value);
    });

    // 두 번째 Map 순회
    assetTradeMonthlySum.forEach((value, key) => {
      const date = moment(key).format('YYYY-MM-DD');
      const existingValue = combinedMap.get(date);
      combinedMap.set(date, existingValue ? existingValue + value : value);
    });
    return combinedMap;
  }

  private static getRate(exchangeRate: ExchangeRateModel[], currency: Currency) {
    return exchangeRate.find((rate) => rate.currency === currency)?.rate || 1;
  }

  private static async getTotalBalance(reqAssetTrend: ReqAssetTrend) {
    const accountList = await AccountService.findAll();
    // 통화별 잔고 합산
    const totalBalanceByCurrency = _(accountList)
      .filter((account) => !account.deleteF)
      .flatMap((account) => account.balance)
      .groupBy((balance) => balance.currency)
      .map((balanceList, currency) => {
        const amount = _.sumBy(balanceList, (balance) => balance.amount);
        return {
          currency,
          amount,
        } as CurrencyAmountModel;
      })
      .value();

    // 주식 자산
    const stockSeqByCurrency = await StockService.getStockSeqByCurrency();
    const stockBuyList = await StockBuyService.findStockBuyAll();
    const totalStockBuyCurrency = _(stockBuyList)
      .filter((stockBuy) => !stockBuy.deleteF)
      .groupBy((stockBuy) => stockSeqByCurrency.get(stockBuy.stockSeq))
      .map((stockBuyList, currency) => {
        const amount = _.sumBy(stockBuyList, (stockBuy) => stockBuy.buyAmount);
        return {
          currency,
          amount,
        } as CurrencyAmountModel;
      })
      .value();

    // 환율 적용해 원화로 계산
    const totalAssetList = [...totalBalanceByCurrency, ...totalStockBuyCurrency];
    return _.sumBy(totalAssetList, (balance) => {
      const rate = this.getRate(reqAssetTrend.exchangeRate, balance.currency);
      return balance.amount * rate;
    });
  }

  // 매도 손익을 통화별 월별 합산
  private static async getAssetSellGainsTrendMap(from: Date, to: Date) {
    const assetSellGainsTrendMap = new Map<Currency, ResSellGainsSum[]>();
    const promise = Object.values(Currency).map(async (currency) => {
      const assetSellGainsTrend = await TradeService.getMonthlySellGainsSum({ from, to, currency });
      assetSellGainsTrendMap.set(currency, assetSellGainsTrend);
    });

    await Promise.all(promise);
    // console.log('assetSellGainsTrendMap', assetSellGainsTrendMap);
    const assetTrendMonthlySumMap = new Map<Currency, DateMap>();
    // 매도 손익 월별 합산
    assetSellGainsTrendMap.forEach((sellGainsList, currency) => {
      _(sellGainsList)
        .groupBy((sellGains) => moment(sellGains.tradeDate).format('YYYY-MM-DD'))
        .forEach((sellGainsListByDate, date) => {
          let monthlyByAmount = assetTrendMonthlySumMap.get(currency);
          if (!monthlyByAmount) {
            monthlyByAmount = new Map<string, number>();
          }

          const sum = _.sumBy(sellGainsListByDate, (sellGains) => sellGains.amount - sellGains.tax - sellGains.fee);
          monthlyByAmount.set(date, sum);

          assetTrendMonthlySumMap.set(currency, monthlyByAmount);
        });
    });
    return assetTrendMonthlySumMap;
  }

  // 지출, 수입을 통화별 월별 합산
  private static async getAssetTransactionTrendMap(from: Date, to: Date) {
    // 통화별 비동기 작업을 병렬로 수행하고 각각의 결과를 저장할 Map 생성
    const assetTransactionTrendMap = new Map<Currency, ResTransactionSum[]>();

    const promises = Object.values(Currency).map(async (currency) => {
      const transactionSums = await TransactionService.getMonthlyAmountSum({ from, to, currency });
      assetTransactionTrendMap.set(currency, transactionSums);
    });
    await Promise.all(promises);

    const assetTransactionMonthlySumMap = new Map<Currency, DateMap>();
    // 수입 - 지출 월별 합산
    assetTransactionTrendMap.forEach((transactionList, currency) => {
      _(transactionList)
        .groupBy((transaction) => moment(transaction.transactionDate).format('YYYY-MM-DD'))
        .forEach((transactionListByDate, date) => {
          let monthlyByAmount = assetTransactionMonthlySumMap.get(currency);
          if (!monthlyByAmount) {
            monthlyByAmount = new Map<string, number>();
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
          monthlyByAmount.set(date, sum);

          assetTransactionMonthlySumMap.set(currency, monthlyByAmount);
        });
    });
    return assetTransactionMonthlySumMap;
  }
}
