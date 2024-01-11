import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { convertToCommaSymbol, getExchangeRate } from '../util/util';
import { AccountType, CurrencyProperties, ExchangeKindProperties } from '../../common/RendererModel';
import { ResExchangeModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import AccountMapper from '../../mapper/AccountMapper';
import ExchangeEditDelete from '../common/part/ExchangeEditDelete';
import { ReqSearchModel } from '../../../common/ReqModel';

interface ExchangeListProps {
  onChange: () => void;
  selectDate: Date;
  forceReload: boolean;
}

function ExchangeList({ onChange, selectDate, forceReload }: ExchangeListProps) {
  const [exchangeList, setExchangeList] = useState<ResExchangeModel[]>([]);

  const reload = async () => {
    const searchMode: ReqSearchModel = {
      from: selectDate,
      to: selectDate,
      checkType: new Set([AccountType.EXCHANGE_BUY, AccountType.EXCHANGE_SELL]),
    };
    const list = await IpcCaller.getExchangeList(searchMode);
    setExchangeList(list);
  };

  useEffect(() => {
    (async () => await reload())();
  }, [selectDate, forceReload]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 환전</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>유형</th>
            <th>내용</th>
            <th>매도금액</th>
            <th>매수금액</th>
            <th>환율</th>
            <th>거래계좌</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          {exchangeList.map((exchange) => {
            const kindProperty = ExchangeKindProperties[exchange.kind];
            return (
              <tr key={exchange.exchangeSeq}>
                <td>
                  <span className={kindProperty.color}>{kindProperty.label}</span>
                </td>
                <td>{exchange.note}</td>
                <td className="right">{convertToCommaSymbol(exchange.sellAmount, exchange.sellCurrency)}</td>
                <td className="right">{convertToCommaSymbol(exchange.buyAmount, exchange.buyCurrency)}</td>
                <td className="right">{getExchangeRate(exchange)}</td>
                <td>{AccountMapper.getName(exchange.accountSeq)}</td>
                <td className="center">
                  <ExchangeEditDelete
                    exchange={exchange}
                    onReload={async () => {
                      await reload();
                      onChange();
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

export default ExchangeList;
