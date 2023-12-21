import { Button, ButtonGroup, Table } from 'react-bootstrap';
import React, { useEffect, useRef } from 'react';
import moment from 'moment/moment';
import { showDeleteDialog } from '../util/util';
import { Currency, CurrencyProperties, ExchangeKind } from '../../common/RendererTypes';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';

interface ExchangeListProps {
  onChange: () => void;
  selectDate: Date;
}

function ExchangeList({ onChange, selectDate }: ExchangeListProps) {
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);
  const handleExchangeDeleteClick = (exchangeSeq: number) => {
    showDeleteDialog(() => {
      console.log(`${exchangeSeq}삭제`);
      onChange();
    });
  };

  const handleExchangeEditClick = (kind: ExchangeKind, exchangeSeq: number) => {
    exchangeModalRef.current?.openExchangeModal(kind, exchangeSeq, () => {
      console.log('저장 완료 reload');
    });
  };

  useEffect(() => {
    console.log('ExchangeList selectDate 날짜 변경', selectDate);
  }, [selectDate]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 환전</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>매도통화</th>
            <th>매도금액</th>
            <th>매수통화</th>
            <th>매수금액</th>
            <th>환율</th>
            <th>거래계좌</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {CurrencyProperties[Currency.USD].name}({CurrencyProperties[Currency.USD].symbol})
            </td>
            <td className="right">500.58</td>
            <td>
              {CurrencyProperties[Currency.KRW].name}({CurrencyProperties[Currency.KRW].symbol})
            </td>
            <td className="right">500,000</td>
            <td className="right">998.84</td>
            <td>복슬증권</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button onClick={() => handleExchangeEditClick(ExchangeKind.BUY, 1)} className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button onClick={() => handleExchangeDeleteClick(1)} className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        </tbody>
      </Table>
      <ExchangeModal ref={exchangeModalRef} />
    </>
  );
}

export default ExchangeList;
