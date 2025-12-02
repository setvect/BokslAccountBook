import { ResSnapshotModel } from '../../../common/ResModel';
import SnapshotHelper from './SnapshotHelper';

export interface ComparisonResult {
  oldValue: number;
  newValue: number;
  change: number;
  changeRate: number;
}

export default class SnapshotCompareHelper {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // do nothing
  }

  /**
   * 두 값의 변화량과 변화율을 계산
   */
  static calculateChange(oldValue: number, newValue: number): ComparisonResult {
    const change = newValue - oldValue;
    const changeRate = oldValue !== 0 ? (change / oldValue) * 100 : newValue !== 0 ? 100 : 0;
    return {
      oldValue,
      newValue,
      change,
      changeRate,
    };
  }

  /**
   * 합산자산 비교
   */
  static compareTotalAmount(oldSnapshot: ResSnapshotModel, newSnapshot: ResSnapshotModel): ComparisonResult {
    const oldValue = SnapshotHelper.getTotalAmount(oldSnapshot);
    const newValue = SnapshotHelper.getTotalAmount(newSnapshot);
    return this.calculateChange(oldValue, newValue);
  }

  /**
   * 평가자산 비교
   */
  static compareEvaluateAmount(oldSnapshot: ResSnapshotModel, newSnapshot: ResSnapshotModel): ComparisonResult {
    const oldValue = SnapshotHelper.getEvaluateAmount(oldSnapshot);
    const newValue = SnapshotHelper.getEvaluateAmount(newSnapshot);
    return this.calculateChange(oldValue, newValue);
  }

  /**
   * 수익금 비교
   */
  static compareProfit(oldSnapshot: ResSnapshotModel, newSnapshot: ResSnapshotModel): ComparisonResult {
    const oldValue = SnapshotHelper.getProfit(oldSnapshot);
    const newValue = SnapshotHelper.getProfit(newSnapshot);
    return this.calculateChange(oldValue, newValue);
  }

  /**
   * 수익률 비교 (퍼센트 값 비교)
   */
  static compareProfitRate(oldSnapshot: ResSnapshotModel, newSnapshot: ResSnapshotModel): ComparisonResult {
    const oldValue = SnapshotHelper.getProfitRate(oldSnapshot);
    const newValue = SnapshotHelper.getProfitRate(newSnapshot);
    return this.calculateChange(oldValue, newValue);
  }

  /**
   * 매도차익 비교
   */
  static compareStockSellProfitLoss(oldSnapshot: ResSnapshotModel, newSnapshot: ResSnapshotModel): ComparisonResult {
    const oldValue = SnapshotHelper.getStockSellProfitLossAmount(oldSnapshot);
    const newValue = SnapshotHelper.getStockSellProfitLossAmount(newSnapshot);
    return this.calculateChange(oldValue, newValue);
  }
}
