import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import CodeMapper from '../../mapper/CodeMapper';
import {
  convertToComma,
  convertToCommaDecimal,
  convertToCommaSymbol,
  convertToPercentage,
  downloadForTable,
  printColorAmount,
  printColorPercentage,
} from '../util/util';
import { CodeKind, Currency } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ResSnapshotModel, ResStockModel } from '../../../common/ResModel';
import { CurrencyProperties } from '../../common/RendererModel';
import { calcYield } from '../../../common/CommonUtil';
import StockMapper from '../../mapper/StockMapper';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import AccountMapper from '../../mapper/AccountMapper';
import TradeCommon from '../common/part/TradeCommon';

export interface SnapshotReadModelHandle {
  openSnapshotReadModal: (snapshotSeq: number) => void;
  hideSnapshotReadModal: () => void;
}

type StockGroupResult = Record<number, { code: number; buyAmount: number; evaluateAmount: number }>;

const SnapshotReadModal = forwardRef<SnapshotReadModelHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [resSnapshotModel, setResSnapshotModel] = useState<ResSnapshotModel>({
    snapshotSeq: 0,
    note: '',
    regDate: new Date(),
    deleteF: false,
    exchangeRateList: [],
    assetGroupList: [],
    stockEvaluateList: [],
    tradeList: [],
  });
  const [stockTypeResultMap, setStockTypeResultMap] = useState<StockGroupResult>({});
  const [stockNationResultMap, setStockNationResultMap] = useState<StockGroupResult>({});
  const reportRef = useRef<HTMLTableElement>(null);

  useImperativeHandle(ref, () => ({
    openSnapshotReadModal: async (snapshotSeq: number) => {
      const snapshotModel = await IpcCaller.getSnapshot(snapshotSeq);
      setResSnapshotModel(snapshotModel);
      setShowModal(true);
    },
    hideSnapshotReadModal: () => setShowModal(false),
  }));

  const getAssetGroupTotalAmountSum = () => {
    return _(resSnapshotModel.assetGroupList).sumBy((assetGroup) => assetGroup.totalAmount);
  };

  const getAssetGroupEvaluateAmountSum = () => {
    return _(resSnapshotModel.assetGroupList).sumBy((assetGroup) => assetGroup.evaluateAmount);
  };

  const getStockBuyAmountSum = () => {
    return _(resSnapshotModel.stockEvaluateList).sumBy((stockEvaluate) => stockEvaluate.buyAmount);
  };

  const getStockEvaluateAmountSum = () => {
    return _(resSnapshotModel.stockEvaluateList).sumBy((stockEvaluate) => stockEvaluate.evaluateAmount);
  };

  // 주식 종류별(종목 유형) 성과
  const getStockResultGroupBy = (group: (resStockModel: ResStockModel) => number) => {
    const stockResults: {
      code: number;
      buyAmount: number;
      evaluateAmount: number;
    }[] = _(resSnapshotModel.stockEvaluateList)
      .groupBy((stockEvaluate) => {
        const { stockSeq } = StockBuyMapper.getStockBuy(stockEvaluate.stockBuySeq);
        const stock = StockMapper.getStock(stockSeq);
        return group(stock);
      })
      .map((stockEvaluateList, groupKey) => {
        return {
          code: parseInt(groupKey, 10),
          buyAmount: _(stockEvaluateList).sumBy((stockEvaluate) => stockEvaluate.buyAmount),
          evaluateAmount: _(stockEvaluateList).sumBy((stockEvaluate) => stockEvaluate.evaluateAmount),
        };
      })
      .value();

    const stockTypeResult: StockGroupResult = stockResults.reduce((acc, stockResult) => {
      const key = stockResult.code;
      acc[key] = stockResult;
      return acc;
    }, {} as StockGroupResult);

    return stockTypeResult;
  };

  const handleDownloadClick = () => {
    const suffix = moment(resSnapshotModel.regDate).format('YYYY-MM-DD');
    downloadForTable(reportRef, `자산스냅샷 - ${suffix}.xls`);
  };

  useEffect(
    () => {
      const resultOfStockType = getStockResultGroupBy((stock) => stock.stockTypeCode);
      const resultOfStockNation = getStockResultGroupBy((stock) => stock.nationCode);

      setStockTypeResultMap(resultOfStockType);
      setStockNationResultMap(resultOfStockNation);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resSnapshotModel],
  );

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="custom-modal-xxl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {resSnapshotModel.note} <em>작성일: {moment(resSnapshotModel.regDate).format('YYYY-MM-DD')}</em>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50" ref={reportRef}>
        <Row className="mb-3">
          <Col>
            <h5>원화(KRW) 기준환율</h5>
            <ul className="horizontal-list">
              {resSnapshotModel.exchangeRateList.map((exchangeRate) => (
                <li key={exchangeRate.currency}>
                  {CurrencyProperties[exchangeRate.currency].name}({exchangeRate.currency}):{' '}
                  <span className="highlight">{convertToCommaDecimal(exchangeRate.rate)}</span>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>계좌 성격별 통계(원화 환산)</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getSubList(CodeKind.ACCOUNT_TYPE).map((item) => {
                  const assetGroup = resSnapshotModel.assetGroupList.find((assetGroup) => assetGroup.accountType === item.codeSeq);
                  if (assetGroup === undefined) {
                    return null;
                  }
                  return (
                    <tr key={item.codeSeq}>
                      <td>{item.name}</td>
                      <td className="right">{convertToComma(assetGroup.totalAmount)}</td>
                      <td className="right">{convertToComma(assetGroup.evaluateAmount)}</td>
                      <td className="right">{printColorAmount(assetGroup.evaluateAmount - assetGroup.totalAmount)}</td>
                      <td className="right">{printColorPercentage(calcYield(assetGroup.totalAmount, assetGroup.evaluateAmount))}</td>
                      <td className="right">{convertToPercentage(assetGroup.totalAmount / getAssetGroupTotalAmountSum())}</td>
                      <td className="right">{convertToPercentage(assetGroup.evaluateAmount / getAssetGroupEvaluateAmountSum())}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">{convertToComma(getAssetGroupTotalAmountSum())}</td>
                  <td className="right">{convertToComma(getAssetGroupEvaluateAmountSum())}</td>
                  <td className="right">{printColorAmount(getAssetGroupEvaluateAmountSum() - getAssetGroupTotalAmountSum())}</td>
                  <td className="right">{printColorPercentage(calcYield(getAssetGroupTotalAmountSum(), getAssetGroupEvaluateAmountSum()))}</td>
                  <td className="right" colSpan={2}>
                    -
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 종류별 통계(원화 환산)</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getSubList(CodeKind.STOCK_TYPE).map((item) => {
                  const stockTypeResult = stockTypeResultMap[item.codeSeq];
                  if (!stockTypeResult) {
                    return null;
                  }

                  return (
                    <tr key={item.codeSeq}>
                      <td>{item.name}</td>
                      <td className="right">{convertToCommaDecimal(stockTypeResult.buyAmount, 0)}</td>
                      <td className="right">{convertToCommaDecimal(stockTypeResult.evaluateAmount, 0)}</td>
                      <td className="right">
                        {printColorAmount(Math.round(stockTypeResult.evaluateAmount - stockTypeResult.buyAmount), Currency.KRW)}
                      </td>
                      <td className="right">{printColorPercentage(calcYield(stockTypeResult.buyAmount, stockTypeResult.evaluateAmount))}</td>
                      <td className="right">{convertToPercentage(stockTypeResult.buyAmount / getStockBuyAmountSum())}</td>
                      <td className="right">{convertToPercentage(stockTypeResult.evaluateAmount / getStockEvaluateAmountSum())}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">{convertToCommaDecimal(getStockBuyAmountSum(), 0)}</td>
                  <td className="right">{convertToCommaDecimal(getStockEvaluateAmountSum(), 0)}</td>
                  <td className="right">{printColorAmount(Math.round(getStockEvaluateAmountSum() - getStockBuyAmountSum()))}</td>
                  <td className="right">{printColorPercentage(calcYield(getStockBuyAmountSum(), getStockEvaluateAmountSum()))}</td>
                  <td className="right" colSpan={2}>
                    -
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 국가별 통계(원화 환산)</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getSubList(CodeKind.NATION_TYPE).map((item) => {
                  const stockNationResult = stockNationResultMap[item.codeSeq];
                  if (!stockNationResult) {
                    return null;
                  }

                  return (
                    <tr key={item.codeSeq}>
                      <td>{item.name}</td>
                      <td className="right">{convertToCommaDecimal(stockNationResult.buyAmount, 0)}</td>
                      <td className="right">{convertToCommaDecimal(stockNationResult.evaluateAmount, 0)}</td>
                      <td className="right">{printColorAmount(Math.round(stockNationResult.evaluateAmount - stockNationResult.buyAmount))}</td>
                      <td className="right">{printColorPercentage(calcYield(stockNationResult.buyAmount, stockNationResult.evaluateAmount))}</td>
                      <td className="right">{convertToPercentage(stockNationResult.buyAmount / getStockBuyAmountSum())}</td>
                      <td className="right">{convertToPercentage(stockNationResult.evaluateAmount / getStockEvaluateAmountSum())}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">{convertToCommaDecimal(getStockBuyAmountSum(), 0)}</td>
                  <td className="right">{convertToCommaDecimal(getStockEvaluateAmountSum(), 0)}</td>
                  <td className="right">{printColorAmount(Math.round(getStockEvaluateAmountSum() - getStockBuyAmountSum()))}</td>
                  <td className="right">{printColorPercentage(calcYield(getStockBuyAmountSum(), getStockEvaluateAmountSum()))}</td>
                  <td className="right" colSpan={2}>
                    -
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 종목별 성과</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>기준통화</th>
                  <th>연결계좌</th>
                  <th>종류</th>
                  <th>상장국가</th>
                  <th>매수금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률(%)</th>
                </tr>
              </thead>
              <tbody>
                {resSnapshotModel.stockEvaluateList.map((stockEvaluate) => {
                  const { stockSeq, accountSeq } = StockBuyMapper.getStockBuy(stockEvaluate.stockBuySeq);
                  const stock = StockMapper.getStock(stockSeq);
                  return (
                    <tr key={stockEvaluate.stockBuySeq}>
                      <td>{stock.name}</td>
                      <td>{CurrencyProperties[stock.currency].name}</td>
                      <td>{AccountMapper.getName(accountSeq)}</td>
                      <td>{CodeMapper.getValue(CodeKind.STOCK_TYPE, stock.stockTypeCode)}</td>
                      <td>{CodeMapper.getValue(CodeKind.NATION_TYPE, stock.nationCode)}</td>
                      <td className="right">{convertToCommaSymbol(stockEvaluate.buyAmount, stock.currency)}</td>
                      <td className="right">{convertToCommaSymbol(stockEvaluate.evaluateAmount, stock.currency)}</td>
                      <td className="right">{printColorAmount(stockEvaluate.evaluateAmount - stockEvaluate.buyAmount, stock.currency)}</td>
                      <td className="right">{printColorPercentage(calcYield(stockEvaluate.buyAmount, stockEvaluate.evaluateAmount))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
        {resSnapshotModel.stockSellCheckDate && (
          <Row className="mb-3">
            <Col>
              <h5>
                주식 매도 내역(기간: {moment(resSnapshotModel.stockSellCheckDate).format('YYYY-MM-DD')} ~{' '}
                {moment(resSnapshotModel.regDate).format('YYYY-MM-DD')})
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <thead>
                  <tr>
                    <th>종목</th>
                    <th>기준통화</th>
                    <th>연결계좌</th>
                    <th>수량</th>
                    <th>단가</th>
                    <th>합산금액</th>
                    <th>매도차익</th>
                    <th>수익률(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {resSnapshotModel.tradeList.map((trade) => {
                    const stock = StockMapper.getStock(trade.stockSeq);
                    return (
                      <tr key={trade.tradeSeq}>
                        <td>{stock.name}</td>
                        <td>{CurrencyProperties[stock.currency].name}</td>
                        <td>{AccountMapper.getName(trade.accountSeq)}</td>
                        <td className="right">{convertToComma(trade.quantity)}</td>
                        <td className="right">{convertToCommaSymbol(trade.price, stock.currency)}</td>
                        <td className="right">{convertToCommaSymbol(trade.quantity * trade.price, stock.currency)}</td>
                        <td className="right">{TradeCommon.renderSellProfit(trade)}</td>
                        <td className="right">{TradeCommon.renderReturnRate(trade)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={() => handleDownloadClick()}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
SnapshotReadModal.displayName = 'SnapshotModal';
export default SnapshotReadModal;
