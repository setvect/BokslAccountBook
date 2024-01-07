import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { AccountType } from '../../common/RendererModel';
import { ResExchangeModel, ResSearchModel, ResTradeModel, ResTransactionModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import TransactionSummary from '../table/TransactionSummary';
import TradeSummary from '../table/TradeSummary';
import ExchangeSummary from '../table/ExchangeSummary';

interface SettlementMonthProps {
  selectDate: Date;
  forceReload: boolean;
}

function SettlementMonth({ selectDate, forceReload }: SettlementMonthProps) {
  const [transactionList, setTransactionList] = useState<ResTransactionModel[]>([]);
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);
  const [exchangeList, setExchangeList] = useState<ResExchangeModel[]>([]);

  const reload = async () => {
    const startDate = moment(selectDate).startOf('month').toDate();
    const endDate = moment(selectDate).endOf('month').toDate();

    const searchMode: ResSearchModel = {
      from: startDate,
      to: endDate,
      checkType: new Set(),
    };
    setTransactionList(
      await IpcCaller.getTransactionList({
        ...searchMode,
        checkType: new Set([AccountType.SPENDING, AccountType.INCOME, AccountType.TRANSFER]),
      }),
    );
    setTradeList(
      await IpcCaller.getTradeList({
        ...searchMode,
        checkType: new Set([AccountType.BUY, AccountType.SELL]),
      }),
    );
    setExchangeList(
      await IpcCaller.getExchangeList({
        ...searchMode,
        checkType: new Set([AccountType.EXCHANGE_BUY, AccountType.EXCHANGE_SELL]),
      }),
    );
  };

  useEffect(() => {
    (async () => await reload())();
  }, [selectDate, forceReload]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월')} 결산</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <tbody>
          <TransactionSummary transactionList={transactionList} />
          <TradeSummary tradeList={tradeList} />
          <ExchangeSummary exchangeList={exchangeList} />
        </tbody>
      </Table>
    </>
  );
}

export default SettlementMonth;
