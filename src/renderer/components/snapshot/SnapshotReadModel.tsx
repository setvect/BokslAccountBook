import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import moment from 'moment';
import { ResSnapshotModel } from '../../../common/ResModel';
import { CodeKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import CodeMapper from '../../mapper/CodeMapper';
import AccountMapper from '../../mapper/AccountMapper';
import { stocks } from '../../state/referenceData';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToCommaDecimal, downloadForTable } from '../util/util';
import useModalSession from '../../hooks/useModalSession';
import useSnapshotReport from '../../hooks/useSnapshotReport';
import ModalStatus from '../common/part/ModalStatus';
import SnapshotValuationTable from './SnapshotValuationTable';
import { SnapshotPositions, SnapshotSales } from './SnapshotPositionTables';

export interface SnapshotReadModelHandle {
  openSnapshotReadModal: (snapshotSeq: number) => void;
  hideSnapshotReadModal: () => void;
}
const SnapshotReadModal = forwardRef<SnapshotReadModelHandle>((_props, ref) => {
  const modal = useModalSession();
  const [snapshot, setSnapshot] = useState<ResSnapshotModel | null>(null);
  const { report, error } = useSnapshotReport(snapshot);
  const reportRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    openSnapshotReadModal: (seq) => {
      modal.open(
        () => setSnapshot(null),
        () => IpcCaller.getSnapshot(seq),
        setSnapshot,
      );
    },
    hideSnapshotReadModal: modal.close,
  }));
  const codeName = (kind: CodeKind) => (id: number) => CodeMapper.getValue(kind, id) ?? `#${id}`;
  return (
    <Modal show={modal.show} onHide={modal.close} animation={false} dialogClassName="custom-modal-xxl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {snapshot?.note ?? '자산 스냅샷'} {snapshot && <em>작성일: {moment(snapshot.regDate).format('YYYY-MM-DD')}</em>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <ModalStatus {...modal} error={modal.error || error} />
        {snapshot && report && (
          <div ref={reportRef}>
            {report.missingRates.length > 0 && (
              <Alert variant="warning">{report.missingRates.join(', ')} 환율이 없어 기존 계산 방식대로 1을 적용했습니다.</Alert>
            )}
            <h5>원화(KRW) 기준환율</h5>
            <ul className="horizontal-list">
              {snapshot.exchangeRateList.map((rate) => (
                <li key={rate.currency}>
                  {CurrencyProperties[rate.currency].name}({rate.currency}): <span className="highlight">{convertToCommaDecimal(rate.rate)}</span>
                </li>
              ))}
            </ul>
            <SnapshotValuationTable
              title="계좌 성격별 통계(원화 환산)"
              rows={report.assets}
              totals={report.totals}
              name={codeName(CodeKind.ACCOUNT_TYPE)}
            />
            <SnapshotValuationTable
              title="주식 종류별 통계(원화 환산)"
              rows={report.stockTypes}
              totals={report.stockTotals}
              name={codeName(CodeKind.STOCK_TYPE)}
            />
            <SnapshotValuationTable
              title="주식 국가별 통계(원화 환산)"
              rows={report.stockNations}
              totals={report.stockTotals}
              name={codeName(CodeKind.NATION_TYPE)}
            />
            <SnapshotPositions
              positions={report.positions}
              accountName={AccountMapper.getName}
              typeName={codeName(CodeKind.STOCK_TYPE)}
              nationName={codeName(CodeKind.NATION_TYPE)}
            />
            {snapshot.stockSellCheckDate && (
              <section>
                <h5>
                  주식 매도 내역(기간: {moment(snapshot.stockSellCheckDate).format('YYYY-MM-DD')} ~ {moment(snapshot.regDate).format('YYYY-MM-DD')})
                </h5>
                <SnapshotSales trades={snapshot.tradeList} stocks={stocks.getSnapshot()} accountName={AccountMapper.getName} />
              </section>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button
          disabled={!report}
          onClick={() => snapshot && downloadForTable(reportRef, `자산스냅샷 - ${moment(snapshot.regDate).format('YYYY-MM-DD')}.xls`)}
        >
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={modal.close}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
SnapshotReadModal.displayName = 'SnapshotReadModal';
export default SnapshotReadModal;
