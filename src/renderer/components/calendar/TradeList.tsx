import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { convertToCommaSymbol } from '../util/util';
import { AccountType, TradeKindProperties } from '../../common/RendererModel';
import { ResTradeModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import TradeEditDelete from '../common/part/TradeEditDelete';
import { ReqSearchModel } from '../../../common/ReqModel';

interface TradeListProps {
  onChange: () => void;
  selectDate: Date;
  forceReload: number;
}

function TradeList({ onChange, selectDate, forceReload }: TradeListProps) {
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);

  const reload = async () => {
    const searchMode: ReqSearchModel = {
      from: selectDate,
      to: selectDate,
      checkType: new Set([AccountType.BUY, AccountType.SELL]),
    };
    const list = await IpcCaller.getTradeList(searchMode);
    setTradeList(list);
  };

  useEffect(
    () => {
      (async () => reload())();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectDate, forceReload],
  );

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 주식 거래</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>유형</th>
            <th>메모</th>
            <th>종목</th>
            <th>수량</th>
            <th>단가 / 합계</th>
            <th>거래계좌</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          {tradeList.map((trade) => {
            const kindProperty = TradeKindProperties[trade.kind];
            const stock = StockMapper.getStock(trade.stockSeq);
            return (
              <tr key={trade.tradeSeq}>
                <td className="nowrap">
                  <span className={kindProperty.color}>{kindProperty.label}</span>
                </td>
                <td>{trade.note}</td>
                <td>{stock.name}</td>
                <td className="right">{trade.quantity}</td>
                <td className="right">
                  {convertToCommaSymbol(trade.price, stock.currency)}
                  <br />= {convertToCommaSymbol(trade.price * trade.quantity, stock.currency)}
                </td>
                <td>{AccountMapper.getName(trade.accountSeq)}</td>
                <td className="center">
                  <TradeEditDelete
                    trade={trade}
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

export default TradeList;
