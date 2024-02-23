import _ from 'lodash';
import { ResSnapshotModel } from '../../../common/ResModel';
import { calcYield } from '../../../common/CommonUtil';
import StockMapper from '../../mapper/StockMapper';

export default class SnapshotHelper {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // do nothing
  }

  static getTotalAmount(resSnapshotModel: ResSnapshotModel) {
    return _(resSnapshotModel.assetGroupList).sumBy((assetGroup) => assetGroup.totalAmount);
  }

  static getEvaluateAmount(resSnapshotModel: ResSnapshotModel) {
    return _(resSnapshotModel.assetGroupList).sumBy((assetGroup) => assetGroup.evaluateAmount);
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
