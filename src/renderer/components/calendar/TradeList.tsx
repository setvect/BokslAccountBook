import { Button, ButtonGroup, Table } from 'react-bootstrap';
import React, { useEffect, useRef } from 'react';
import moment from 'moment/moment';
import { showDeleteDialog } from '../util/util';
import { CurrencyProperties } from '../../common/RendererTypes';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import { Currency, TradeKind } from '../../../common/CommonType';

interface TradeListProps {
  onChange: () => void;
  selectDate: Date;
}

function TradeList({ onChange, selectDate }: TradeListProps) {
  const tradeModalRef = useRef<TradeModalHandle>(null);
  const handleTradeDeleteClick = (tradeSeq: number) => {
    showDeleteDialog(() => {
      console.log(`${tradeSeq}삭제`);
      onChange();
    });
  };

  const handleTradeEditClick = (kind: TradeKind, tradeSeq: number) => {
    tradeModalRef.current?.openTradeModal(kind, tradeSeq, null, () => {
      console.log('저장 완료 reload');
    });
  };

  useEffect(() => {
    console.log('TradeList selectDate 날짜 변경', selectDate);
  }, [selectDate]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 주식 거래</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>유형</th>
            <th>내용</th>
            <th>종목</th>
            <th>수량</th>
            <th>단가 / 합계</th>
            <th>거래계좌</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="account-buy">매수</span>
            </td>
            <td>자산배분</td>
            <td>SPDR S&P 500 ETF</td>
            <td className="right">100</td>
            <td className="right">
              {CurrencyProperties[Currency.USD].symbol} 100.50
              <br />= {CurrencyProperties[Currency.USD].symbol} 100,000.00
            </td>
            <td>복슬증권</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button onClick={() => handleTradeEditClick(TradeKind.BUY, 1)} className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button onClick={() => handleTradeDeleteClick(1)} className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
          <tr>
            <td>
              <span className="account-sell">매도</span>
            </td>
            <td>자산배분</td>
            <td>복슬전자</td>
            <td className="right">100,000</td>
            <td className="right">
              {CurrencyProperties[Currency.KRW].symbol} 100
              <br />= {CurrencyProperties[Currency.KRW].symbol} 10,000,000
            </td>
            <td>복슬증권</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        </tbody>
      </Table>
      <TradeModal ref={tradeModalRef} />
    </>
  );
}

export default TradeList;
