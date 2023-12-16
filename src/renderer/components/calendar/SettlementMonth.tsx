import { Table } from 'react-bootstrap';
import React, { useEffect } from 'react';
import moment from 'moment/moment';
import { Currency, CurrencyProperties } from '../../common/BokslTypes';

interface SettlementMonthProps {
  selectDate: Date;
}

function SettlementMonth({ selectDate }: SettlementMonthProps) {
  useEffect(() => {
    console.log('SettlementMonth selectDate 날짜 변경', selectDate);
  }, [selectDate]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월')} 결산</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <tbody>
          <tr>
            <td>
              <span className="account-spending">지출</span>
            </td>
            <td className="right">10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-income">수입</span>
            </td>
            <td className="right">10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-income">수입</span> - <span className="account-spending">지출</span>
            </td>
            <td className="right">10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-transfer">이체</span>
            </td>
            <td className="right">10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-buy">매수</span>
            </td>
            <td className="right">{CurrencyProperties[Currency.KRW].symbol} 10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-buy">매수</span>
            </td>
            <td className="right">{CurrencyProperties[Currency.USD].symbol} 10,000.05</td>
          </tr>
          <tr>
            <td>
              <span className="account-sell">매도</span>
            </td>
            <td className="right">{CurrencyProperties[Currency.KRW].symbol} 10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-buy">원화 매수</span>
            </td>
            <td className="right">10,000</td>
          </tr>
          <tr>
            <td>
              <span className="account-sell">원화 매도</span>
            </td>
            <td className="right">10,000</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export default SettlementMonth;
