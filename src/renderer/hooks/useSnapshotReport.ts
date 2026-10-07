import { useMemo } from 'react';
import { ResSnapshotModel } from '../../common/ResModel';
import { buildSnapshotReport } from '../../common/calculation/snapshotReport';
import { holdings, stocks, useReferenceData } from '../state/referenceData';

export default function useSnapshotReport(snapshot: ResSnapshotModel | null) {
  useReferenceData();
  const stockList = stocks.getSnapshot();
  const holdingList = holdings.getSnapshot();
  return useMemo(() => {
    if (!snapshot) return { report: undefined, error: '' };
    try {
      return { report: buildSnapshotReport(snapshot, stockList, holdingList), error: '' };
    } catch (error) {
      return { report: undefined, error: error instanceof Error ? error.message : '스냅샷 계산에 실패했습니다.' };
    }
  }, [snapshot, stockList, holdingList]);
}
