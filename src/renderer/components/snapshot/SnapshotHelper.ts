import _ from 'lodash';
import { ResSnapshotModel } from '../../../common/ResModel';
import { calcYield } from '../../../common/CommonUtil';
import StockMapper from '../../mapper/StockMapper';
import { Currency, ExchangeRateModel } from '../../../common/CommonType';

function getExchangeRate(exchangeRateList: ExchangeRateModel[], currency: Currency) {
  const matchedExchangeRate = exchangeRateList.find((exchangeRate) => exchangeRate.currency === currency);
  return matchedExchangeRate?.rate || 1;
}

export default class SnapshotHelper {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // do nothing
  }

  static getTotalAmount(resSnapshotModel: ResSnapshotModel, accountType: number | null = null) {
    return _(resSnapshotModel.assetGroupList)
      .filter((assetGroup) => accountType === null || assetGroup.accountType === accountType)
      .sumBy((assetGroup) => {
        const rate = getExchangeRate(resSnapshotModel.exchangeRateList, assetGroup.currency);
        return assetGroup.totalAmount * rate;
      });
  }

  static getEvaluateAmount(resSnapshotModel: ResSnapshotModel, accountType: number | null = null) {
    return _(resSnapshotModel.assetGroupList)
      .filter((assetGroup) => accountType === null || assetGroup.accountType === accountType)
      .sumBy((assetGroup) => {
        const rate = getExchangeRate(resSnapshotModel.exchangeRateList, assetGroup.currency);
        return assetGroup.evaluateAmount * rate;
      });
  }

  static getProfit(resSnapshotModel: ResSnapshotModel) {
    return this.getEvaluateAmount(resSnapshotModel) - this.getTotalAmount(resSnapshotModel);
  }

  static getProfitRate(resSnapshotModel: ResSnapshotModel) {
    return calcYield(this.getTotalAmount(resSnapshotModel), this.getEvaluateAmount(resSnapshotModel));
  }

  /**
   * 매도차익, 원화로 환산한 금액
   */
  static getStockSellProfitLossAmount(resSnapshotModel: ResSnapshotModel) {
    return _(resSnapshotModel.tradeList).sumBy((trade) => {
      const stock = StockMapper.getStock(trade.stockSeq);
      const currencyRate = _(resSnapshotModel.exchangeRateList).find((exchangeRate) => exchangeRate.currency === stock.currency)?.rate || 1;
      return trade.sellGains * currencyRate;
    });
  }
}
