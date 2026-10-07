import _ from 'lodash';
import { ResSnapshotModel, ResStockModel } from '../../../common/ResModel';
import { calcYield } from '../../../common/CommonUtil';
import { soldProfit } from '../../../common/calculation/snapshotReport';

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
  static getStockSellProfitLossAmount(snapshot: ResSnapshotModel, stocks: ResStockModel[]) {
    return soldProfit(snapshot, stocks);
  }
}
