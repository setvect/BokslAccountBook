import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, CurrencyProperties } from '../../common/RendererModel';
import { Currency } from '../../../common/CommonType';
import { ResSearchModel, ResTransactionModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import TransactionSummary from '../table/TransactionSummary';

interface SettlementMonthProps {
  selectDate: Date;
}

function SettlementMonth({ selectDate }: SettlementMonthProps) {
  const [transactionList, setTransactionList] = useState<ResTransactionModel[]>([]);

  const reload = async () => {
    const startDate = moment(selectDate).startOf('month').toDate();
    const endDate = moment(selectDate).endOf('month').toDate();

    const searchMode: ResSearchModel = {
      from: startDate,
      to: endDate,
      checkType: new Set(),
    };
    const list = await IpcCaller.getTransactionList({
      ...searchMode,
      checkType: new Set([AccountType.SPENDING, AccountType.INCOME, AccountType.TRANSFER]),
    });
    setTransactionList(list);
  };

  useEffect(() => {
    (async () => await reload())();
  }, [selectDate]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월')} 결산</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <tbody>
          <TransactionSummary transactionList={transactionList} />
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
