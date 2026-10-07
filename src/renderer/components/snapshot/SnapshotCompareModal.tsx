import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Button, Modal, Table } from 'react-bootstrap';
import moment from 'moment';
import { CodeKind, Currency } from '../../../common/CommonType';
import { ResSnapshotModel } from '../../../common/ResModel';
import { compareValuations, GroupValuation } from '../../../common/calculation/snapshotReport';
import IpcCaller from '../../common/IpcCaller';
import CodeMapper from '../../mapper/CodeMapper';
import AccountMapper from '../../mapper/AccountMapper';
import { convertToCommaDecimal, downloadForTable, printColorAmount } from '../util/util';
import useModalSession from '../../hooks/useModalSession';
import useSnapshotReport from '../../hooks/useSnapshotReport';
import ModalStatus from '../common/part/ModalStatus';
import SnapshotComparisonTable, { ComparisonRow } from './SnapshotComparisonTable';

export interface SnapshotCompareModalHandle {
  openCompareModal: (first: number, second: number) => void;
  hideCompareModal: () => void;
}
const SnapshotCompareModal = forwardRef<SnapshotCompareModalHandle>((_props, ref) => {
  const modal = useModalSession();
  const [pair, setPair] = useState<[ResSnapshotModel, ResSnapshotModel] | null>(null);
  const oldResult = useSnapshotReport(pair?.[0] ?? null);
  const newResult = useSnapshotReport(pair?.[1] ?? null);
  const reportRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    openCompareModal: (first, second) => {
      modal.open(
        () => setPair(null),
        () => Promise.all([IpcCaller.getSnapshot(first), IpcCaller.getSnapshot(second)]),
        ([one, two]) => setPair(one.snapshotSeq < two.snapshotSeq ? [one, two] : [two, one]),
      );
    },
    hideCompareModal: modal.close,
  }));
  const [oldSnapshot, newSnapshot] = pair ?? [];
  const oldReport = oldResult.report;
  const newReport = newResult.report;
  const groupRows = (before: GroupValuation[], after: GroupValuation[], kind: CodeKind): ComparisonRow[] =>
    compareValuations(before, after, (item) => item.code).map((values) => ({
      id: values.key,
      label: CodeMapper.getValue(kind, values.key) ?? `#${values.key}`,
      detail: '',
      currency: Currency.KRW,
      values,
    }));
  const download = () => {
    if (!oldSnapshot || !newSnapshot) return;
    downloadForTable(
      reportRef,
      `자산스냅샷 비교 - ${moment(oldSnapshot.regDate).format('YYYY-MM-DD')} vs ${moment(newSnapshot.regDate).format('YYYY-MM-DD')}.xls`,
    );
  };
  return (
    <Modal show={modal.show} onHide={modal.close} animation={false} dialogClassName="modal-fullscreen" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          자산 스냅샷 비교{' '}
          {oldSnapshot && newSnapshot && (
            <>
              : {oldSnapshot.note} ({moment(oldSnapshot.regDate).format('YYYY-MM-DD')}) → {newSnapshot.note} (
              {moment(newSnapshot.regDate).format('YYYY-MM-DD')})
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <ModalStatus {...modal} error={modal.error || oldResult.error || newResult.error} />
        {oldSnapshot && newSnapshot && oldReport && newReport && (
          <div ref={reportRef}>
            {(oldReport.missingRates.length > 0 || newReport.missingRates.length > 0) && (
              <Alert variant="warning">환율이 누락된 통화는 기존 계산 방식대로 1을 적용했습니다.</Alert>
            )}
            <section className="mb-4">
              <h5>원화(KRW) 기준환율 비교</h5>
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr>
                    <th>통화</th>
                    <th>이전 환율</th>
                    <th>현재 환율</th>
                    <th>변화</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Set([...oldSnapshot.exchangeRateList, ...newSnapshot.exchangeRateList].map((rate) => rate.currency))].map((currency) => {
                    const before = oldSnapshot.exchangeRateList.find((rate) => rate.currency === currency)?.rate;
                    const after = newSnapshot.exchangeRateList.find((rate) => rate.currency === currency)?.rate;
                    return (
                      <tr key={currency}>
                        <td>{currency}</td>
                        <td>{before === undefined ? '-' : convertToCommaDecimal(before)}</td>
                        <td>{after === undefined ? '-' : convertToCommaDecimal(after)}</td>
                        <td>{before !== undefined && after !== undefined ? printColorAmount(after - before) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </section>
            <SnapshotComparisonTable
              title="계좌 성격별 통계 비교(원화 환산)"
              rows={groupRows(oldReport.assets, newReport.assets, CodeKind.ACCOUNT_TYPE)}
            />
            <SnapshotComparisonTable
              title="주식 종류별 통계 비교(원화 환산)"
              rows={groupRows(oldReport.stockTypes, newReport.stockTypes, CodeKind.STOCK_TYPE)}
            />
            <SnapshotComparisonTable
              title="주식 국가별 통계 비교(원화 환산)"
              rows={groupRows(oldReport.stockNations, newReport.stockNations, CodeKind.NATION_TYPE)}
            />
            <SnapshotComparisonTable
              title="주식 종목별 성과 비교"
              rows={compareValuations(oldReport.positions, newReport.positions, (position) => position.stockBuySeq).map((values) => {
                const position = values.after ?? values.before;
                if (!position) throw new Error('비교할 보유종목이 없습니다.');
                return {
                  id: values.key,
                  label: position.stock.name,
                  detail: `${position.stock.currency} · ${AccountMapper.getName(position.accountSeq)}`,
                  currency: position.stock.currency,
                  values,
                };
              })}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button disabled={!oldReport || !newReport} onClick={download}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={modal.close}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
SnapshotCompareModal.displayName = 'SnapshotCompareModal';
export default SnapshotCompareModal;
