import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { convertToCommaSymbol } from '../util/util';
import { AccountType, TradeKindProperties } from '../../common/RendererModel';
import { ResSearchModel, ResTradeModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import TradeEditDelete from '../common/part/TradeEditDelete';

interface TradeListProps {
  onChange: () => void;
  selectDate: Date;
  forceReload: boolean;
}

function TradeList({ onChange, selectDate, forceReload }: TradeListProps) {
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);

  const reload = async () => {
    const searchMode: ResSearchModel = {
      from: selectDate,
      to: selectDate,
      checkType: new Set([AccountType.BUY, AccountType.SELL]),
    };
    const list = await IpcCaller.getTradeList(searchMode);
    setTradeList(list);
  };

  useEffect(() => {
    (async () => await reload())();
  }, [selectDate, forceReload]);

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
          {tradeList.map((trade) => {
            const kindProperty = TradeKindProperties[trade.kind];
            let stock = StockMapper.getStock(trade.stockSeq);
            return (
              <tr key={trade.tradeSeq}>
                <td>
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
