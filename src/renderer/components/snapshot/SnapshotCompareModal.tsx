import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import { useReferenceData } from '../../state/referenceData';
import CodeMapper from '../../mapper/CodeMapper';
import { convertToComma, convertToCommaDecimal, convertToCommaSymbol, downloadForTable, printColorAmount } from '../util/util';
import { CodeKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ResSnapshotModel, ResStockEvaluateModel } from '../../../common/ResModel';
import { CurrencyProperties } from '../../common/RendererModel';
import { calcYield } from '../../../common/CommonUtil';
import StockMapper from '../../mapper/StockMapper';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import AccountMapper from '../../mapper/AccountMapper';
import SnapshotCompareHelper from './SnapshotCompareHelper';

export interface SnapshotCompareModalHandle {
  openCompareModal: (snapshotSeq1: number, snapshotSeq2: number) => void;
  hideCompareModal: () => void;
}

type StockGroupResult = Record<number, { code: number; buyAmount: number; evaluateAmount: number }>;

const SnapshotCompareModal = forwardRef<SnapshotCompareModalHandle, {}>((props, ref) => {
  useReferenceData();
  const [showModal, setShowModal] = useState(false);
  const [oldSnapshot, setOldSnapshot] = useState<ResSnapshotModel | null>(null);
  const [newSnapshot, setNewSnapshot] = useState<ResSnapshotModel | null>(null);
  const reportRef = useRef<HTMLTableElement>(null);

  useImperativeHandle(ref, () => ({
    openCompareModal: async (snapshotSeq1: number, snapshotSeq2: number) => {
      const snapshot1 = await IpcCaller.getSnapshot(snapshotSeq1);
      const snapshot2 = await IpcCaller.getSnapshot(snapshotSeq2);

      // 일련번호 기준으로 정렬 (작은 것이 old, 큰 것이 new)
      if (snapshot1.snapshotSeq < snapshot2.snapshotSeq) {
        setOldSnapshot(snapshot1);
        setNewSnapshot(snapshot2);
      } else {
        setOldSnapshot(snapshot2);
        setNewSnapshot(snapshot1);
      }
      setShowModal(true);
    },
    hideCompareModal: () => setShowModal(false),
  }));

  const handleDownloadClick = () => {
    if (!oldSnapshot || !newSnapshot) return;
    const oldDate = moment(oldSnapshot.regDate).format('YYYY-MM-DD');
    const newDate = moment(newSnapshot.regDate).format('YYYY-MM-DD');
    downloadForTable(reportRef, `자산스냅샷 비교 - ${oldDate} vs ${newDate}.xls`);
  };

  // 환율 계산 함수
  const calculateExchangeRate = (snapshot: ResSnapshotModel, stockEvaluate: ResStockEvaluateModel, amountType: 'buyAmount' | 'evaluateAmount') => {
    const exchangeRate = snapshot.exchangeRateList.find((exchangeRate) => {
      const stockBuy = StockBuyMapper.getStockBuy(stockEvaluate.stockBuySeq);
      const stock = StockMapper.getStock(stockBuy.stockSeq);
      return exchangeRate.currency === stock.currency;
    });
    const rate = exchangeRate ? exchangeRate.rate : 1;
    return stockEvaluate[amountType] * rate;
  };

  // 주식 그룹별 결과 계산
  const getStockResultGroupBy = (snapshot: ResSnapshotModel, group: (stock: any) => number): StockGroupResult => {
    const stockResults = _(snapshot.stockEvaluateList)
      .groupBy((stockEvaluate) => {
        const { stockSeq } = StockBuyMapper.getStockBuy(stockEvaluate.stockBuySeq);
        const stock = StockMapper.getStock(stockSeq);
        return group(stock);
      })
      .map((stockEvaluateList, groupKey) => {
        const buyAmount = _(stockEvaluateList).sumBy((stockEvaluate) => calculateExchangeRate(snapshot, stockEvaluate, 'buyAmount'));
        const evaluateAmount = _(stockEvaluateList).sumBy((stockEvaluate) => calculateExchangeRate(snapshot, stockEvaluate, 'evaluateAmount'));
        return {
          code: parseInt(groupKey, 10),
          buyAmount,
          evaluateAmount,
        };
      })
      .value();

    return stockResults.reduce((acc, stockResult) => {
      acc[stockResult.code] = stockResult;
      return acc;
    }, {} as StockGroupResult);
  };

  if (!oldSnapshot || !newSnapshot) {
    return null;
  }

  // 계좌 성격별 비교 데이터
  const assetGroupComparison = CodeMapper.getSubList(CodeKind.ACCOUNT_TYPE).map((item) => {
    const oldAsset = oldSnapshot.assetGroupList.find((ag) => ag.accountType === item.codeSeq);
    const newAsset = newSnapshot.assetGroupList.find((ag) => ag.accountType === item.codeSeq);

    const oldTotal = oldAsset ? oldAsset.totalAmount : null;
    const newTotal = newAsset ? newAsset.totalAmount : null;
    const oldEval = oldAsset ? oldAsset.evaluateAmount : null;
    const newEval = newAsset ? newAsset.evaluateAmount : null;

    return {
      name: item.name,
      totalAmount: SnapshotCompareHelper.calculateChange(oldTotal ?? 0, newTotal ?? 0),
      evaluateAmount: SnapshotCompareHelper.calculateChange(oldEval ?? 0, newEval ?? 0),
      profit: SnapshotCompareHelper.calculateChange((oldEval ?? 0) - (oldTotal ?? 0), (newEval ?? 0) - (newTotal ?? 0)),
      profitRate: SnapshotCompareHelper.calculateChange(calcYield(oldTotal ?? 0, oldEval ?? 0), calcYield(newTotal ?? 0, newEval ?? 0)),
      oldExists: oldAsset !== undefined,
      newExists: newAsset !== undefined,
    };
  });

  // 주식 종류별 비교
  const oldStockTypeMap = getStockResultGroupBy(oldSnapshot, (stock) => stock.stockTypeCode);
  const newStockTypeMap = getStockResultGroupBy(newSnapshot, (stock) => stock.stockTypeCode);

  const stockTypeComparison = CodeMapper.getSubList(CodeKind.STOCK_TYPE).map((item) => {
    const oldResult = oldStockTypeMap[item.codeSeq];
    const newResult = newStockTypeMap[item.codeSeq];

    const oldBuy = oldResult ? oldResult.buyAmount : null;
    const newBuy = newResult ? newResult.buyAmount : null;
    const oldEval = oldResult ? oldResult.evaluateAmount : null;
    const newEval = newResult ? newResult.evaluateAmount : null;

    return {
      name: item.name,
      buyAmount: SnapshotCompareHelper.calculateChange(oldBuy ?? 0, newBuy ?? 0),
      evaluateAmount: SnapshotCompareHelper.calculateChange(oldEval ?? 0, newEval ?? 0),
      profit: SnapshotCompareHelper.calculateChange((oldEval ?? 0) - (oldBuy ?? 0), (newEval ?? 0) - (newBuy ?? 0)),
      profitRate: SnapshotCompareHelper.calculateChange(calcYield(oldBuy ?? 0, oldEval ?? 0), calcYield(newBuy ?? 0, newEval ?? 0)),
      oldExists: oldResult !== undefined,
      newExists: newResult !== undefined,
    };
  });

  // 주식 국가별 비교
  const oldStockNationMap = getStockResultGroupBy(oldSnapshot, (stock) => stock.nationCode);
  const newStockNationMap = getStockResultGroupBy(newSnapshot, (stock) => stock.nationCode);

  const stockNationComparison = CodeMapper.getSubList(CodeKind.NATION_TYPE).map((item) => {
    const oldResult = oldStockNationMap[item.codeSeq];
    const newResult = newStockNationMap[item.codeSeq];

    const oldBuy = oldResult ? oldResult.buyAmount : null;
    const newBuy = newResult ? newResult.buyAmount : null;
    const oldEval = oldResult ? oldResult.evaluateAmount : null;
    const newEval = newResult ? newResult.evaluateAmount : null;

    return {
      name: item.name,
      buyAmount: SnapshotCompareHelper.calculateChange(oldBuy ?? 0, newBuy ?? 0),
      evaluateAmount: SnapshotCompareHelper.calculateChange(oldEval ?? 0, newEval ?? 0),
      profit: SnapshotCompareHelper.calculateChange((oldEval ?? 0) - (oldBuy ?? 0), (newEval ?? 0) - (newBuy ?? 0)),
      profitRate: SnapshotCompareHelper.calculateChange(calcYield(oldBuy ?? 0, oldEval ?? 0), calcYield(newBuy ?? 0, newEval ?? 0)),
      oldExists: oldResult !== undefined,
      newExists: newResult !== undefined,
    };
  });

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} dialogClassName="modal-fullscreen" centered data-bs-theme="dark">
      <Modal.Header className="bg-dark text-white-50">
        <Modal.Title>
          자산 스냅샷 비교: <em>{oldSnapshot.note}</em> ({moment(oldSnapshot.regDate).format('YYYY-MM-DD')}) → <em>{newSnapshot.note}</em> (
          {moment(newSnapshot.regDate).format('YYYY-MM-DD')})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50" style={{ overflowY: 'auto' }}>
        <div ref={reportRef}>
          {/* 환율 비교 */}
          <Row className="mb-4">
            <Col>
              <h5>💱 원화(KRW) 기준환율 비교</h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th>통화</th>
                    <th>이전 환율</th>
                    <th>현재 환율</th>
                    <th>변화</th>
                  </tr>
                </thead>
                <tbody>
                  {_.uniqBy([...oldSnapshot.exchangeRateList, ...newSnapshot.exchangeRateList], 'currency').map((er) => {
                    const oldRate = oldSnapshot.exchangeRateList.find((r) => r.currency === er.currency)?.rate || 0;
                    const newRate = newSnapshot.exchangeRateList.find((r) => r.currency === er.currency)?.rate || 0;
                    const change = newRate - oldRate;
                    const changeRate = oldRate !== 0 ? (change / oldRate) * 100 : 0;

                    let changeSymbol = '=';
                    if (change > 0) {
                      changeSymbol = '▲';
                    } else if (change < 0) {
                      changeSymbol = '▼';
                    }

                    return (
                      <tr key={er.currency}>
                        <td>
                          {CurrencyProperties[er.currency].name} ({er.currency})
                        </td>
                        <td className="right text-muted">{convertToCommaDecimal(oldRate)}</td>
                        <td className="right fw-bold">{convertToCommaDecimal(newRate)}</td>
                        <td className="right">
                          <div className={change >= 0 ? 'account-buy' : 'account-sell'}>
                            {changeSymbol} {convertToCommaDecimal(Math.abs(change))} ({changeRate.toFixed(2)}%)
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* 계좌 성격별 비교 */}
          <Row className="mb-4">
            <Col>
              <h5>🏦 계좌 성격별 통계 비교 (원화 환산)</h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th rowSpan={2}>계좌성격</th>
                    <th colSpan={4}>이전</th>
                    <th colSpan={4}>현재</th>
                    <th colSpan={3}>변화</th>
                  </tr>
                  <tr>
                    <th>합산금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>합산금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>합산금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                  </tr>
                </thead>
                <tbody>
                  {assetGroupComparison
                    .filter((item) => item.totalAmount.oldValue !== 0 || item.totalAmount.newValue !== 0)
                    .map((item) => (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(item.totalAmount.oldValue)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(item.evaluateAmount.oldValue)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? <span style={{ display: 'block', textAlign: 'center' }}>-</span> : convertToComma(item.profit.oldValue)}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.oldValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(item.totalAmount.newValue)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(item.evaluateAmount.newValue)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? <span style={{ display: 'block', textAlign: 'center' }}>-</span> : convertToComma(item.profit.newValue)}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.newValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(item.totalAmount.change)
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(item.evaluateAmount.change)
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(item.profit.change)
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* 주식 종류별 비교 */}
          <Row className="mb-4">
            <Col>
              <h5>📈 주식 종류별 통계 비교 (원화 환산)</h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th rowSpan={2}>종류</th>
                    <th colSpan={4}>이전</th>
                    <th colSpan={4}>현재</th>
                    <th colSpan={3}>변화</th>
                  </tr>
                  <tr>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                  </tr>
                </thead>
                <tbody>
                  {stockTypeComparison
                    .filter((item) => item.buyAmount.oldValue !== 0 || item.buyAmount.newValue !== 0)
                    .map((item) => (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.buyAmount.oldValue, 0)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.evaluateAmount.oldValue, 0)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(Math.round(item.profit.oldValue))
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.oldValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.buyAmount.newValue, 0)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.evaluateAmount.newValue, 0)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(Math.round(item.profit.newValue))
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.newValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.buyAmount.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.evaluateAmount.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.profit.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* 주식 국가별 비교 */}
          <Row className="mb-4">
            <Col>
              <h5>🌍 주식 국가별 통계 비교 (원화 환산)</h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th rowSpan={2}>국가</th>
                    <th colSpan={4}>이전</th>
                    <th colSpan={4}>현재</th>
                    <th colSpan={3}>변화</th>
                  </tr>
                  <tr>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                  </tr>
                </thead>
                <tbody>
                  {stockNationComparison
                    .filter((item) => item.buyAmount.oldValue !== 0 || item.buyAmount.newValue !== 0)
                    .map((item) => (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.buyAmount.oldValue, 0)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.evaluateAmount.oldValue, 0)
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(Math.round(item.profit.oldValue))
                          )}
                        </td>
                        <td className="right text-muted">
                          {!item.oldExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.oldValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.buyAmount.newValue, 0)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToCommaDecimal(item.evaluateAmount.newValue, 0)
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            convertToComma(Math.round(item.profit.newValue))
                          )}
                        </td>
                        <td className="right fw-bold">
                          {!item.newExists ? (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          ) : (
                            `${item.profitRate.newValue.toFixed(2)}%`
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.buyAmount.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.evaluateAmount.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                        <td className="right">
                          {item.oldExists && item.newExists ? (
                            printColorAmount(Math.round(item.profit.change))
                          ) : (
                            <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>

          {/* 주식 종목별 성과 비교 */}
          <Row className="mb-4">
            <Col>
              <h5>📊 주식 종목별 성과 비교</h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th rowSpan={2}>종목</th>
                    <th rowSpan={2}>기준통화</th>
                    <th rowSpan={2}>연결계좌</th>
                    <th colSpan={4}>이전</th>
                    <th colSpan={4}>현재</th>
                    <th colSpan={3}>변화</th>
                  </tr>
                  <tr>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                    <th>수익률</th>
                    <th>매수금액</th>
                    <th>평가금액</th>
                    <th>수익금</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // 두 스냅샷의 모든 stockBuySeq 수집
                    const allStockBuySeqs = new Set([
                      ...oldSnapshot.stockEvaluateList.map((se) => se.stockBuySeq),
                      ...newSnapshot.stockEvaluateList.map((se) => se.stockBuySeq),
                    ]);

                    return Array.from(allStockBuySeqs).map((stockBuySeq) => {
                      const oldStock = oldSnapshot.stockEvaluateList.find((se) => se.stockBuySeq === stockBuySeq);
                      const newStock = newSnapshot.stockEvaluateList.find((se) => se.stockBuySeq === stockBuySeq);

                      // stockBuySeq가 존재하지 않을 수 있으므로 첫 번째로 찾은 것 사용
                      const stockBuy = StockBuyMapper.getStockBuy(stockBuySeq);
                      const stock = StockMapper.getStock(stockBuy.stockSeq);
                      const account = AccountMapper.getName(stockBuy.accountSeq);

                      const oldBuy = oldStock ? oldStock.buyAmount : null;
                      const newBuy = newStock ? newStock.buyAmount : null;
                      const oldEval = oldStock ? oldStock.evaluateAmount : null;
                      const newEval = newStock ? newStock.evaluateAmount : null;

                      const oldProfit = oldStock ? oldEval! - oldBuy! : null;
                      const newProfit = newStock ? newEval! - newBuy! : null;
                      const oldRate = oldStock ? calcYield(oldBuy!, oldEval!) : null;
                      const newRate = newStock ? calcYield(newBuy!, newEval!) : null;

                      return (
                        <tr key={stockBuySeq}>
                          <td>{stock.name}</td>
                          <td>{CurrencyProperties[stock.currency].name}</td>
                          <td>{account}</td>
                          <td className="right text-muted">
                            {oldStock ? (
                              convertToCommaSymbol(oldBuy!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right text-muted">
                            {oldStock ? (
                              convertToCommaSymbol(oldEval!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right text-muted">
                            {oldStock ? (
                              convertToCommaSymbol(oldProfit!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right text-muted">
                            {oldStock ? `${oldRate!.toFixed(2)}%` : <span style={{ display: 'block', textAlign: 'center' }}>-</span>}
                          </td>
                          <td className="right fw-bold">
                            {newStock ? (
                              convertToCommaSymbol(newBuy!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right fw-bold">
                            {newStock ? (
                              convertToCommaSymbol(newEval!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right fw-bold">
                            {newStock ? (
                              convertToCommaSymbol(newProfit!, stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right fw-bold">
                            {newStock ? `${newRate!.toFixed(2)}%` : <span style={{ display: 'block', textAlign: 'center' }}>-</span>}
                          </td>
                          <td className="right">
                            {oldStock && newStock ? (
                              printColorAmount((newBuy ?? 0) - (oldBuy ?? 0), stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right">
                            {oldStock && newStock ? (
                              printColorAmount((newEval ?? 0) - (oldEval ?? 0), stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                          <td className="right">
                            {oldStock && newStock ? (
                              printColorAmount((newProfit ?? 0) - (oldProfit ?? 0), stock.currency)
                            ) : (
                              <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50" style={{ borderTop: 'none' }}>
        <Button variant="primary" onClick={handleDownloadClick}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

SnapshotCompareModal.displayName = 'SnapshotCompareModal';
export default SnapshotCompareModal;
