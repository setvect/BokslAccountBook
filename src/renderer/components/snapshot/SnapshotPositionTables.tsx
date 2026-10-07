import { Table } from 'react-bootstrap';
import { HoldingValuation, portion } from '../../../common/calculation/snapshotReport';
import { ResStockModel, ResTradeModel } from '../../../common/ResModel';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToComma, convertToCommaSymbol, printColorAmount, printColorPercentage } from '../util/util';

interface PositionProps {
  positions: HoldingValuation[];
  accountName: (id: number) => string;
  typeName: (id: number) => string;
  nationName: (id: number) => string;
}
export function SnapshotPositions({ positions, accountName, typeName, nationName }: PositionProps) {
  return (
    <section className="mb-3">
      <h5>주식 종목별 성과</h5>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            {['종목', '기준통화', '연결계좌', '종류', '상장국가', '매수금액', '평가금액', '수익금', '수익률(%)'].map((name) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((row) => (
            <tr key={row.stockBuySeq}>
              <td>{row.stock.name}</td>
              <td>{CurrencyProperties[row.stock.currency].name}</td>
              <td>{accountName(row.accountSeq)}</td>
              <td>{typeName(row.stock.stockTypeCode)}</td>
              <td>{nationName(row.stock.nationCode)}</td>
              <td className="right">{convertToCommaSymbol(row.buyAmount, row.stock.currency)}</td>
              <td className="right">{convertToCommaSymbol(row.evaluateAmount, row.stock.currency)}</td>
              <td className="right">{printColorAmount(row.profit, row.stock.currency)}</td>
              <td className="right">{printColorPercentage(row.profitRate)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
interface SalesProps {
  trades: ResTradeModel[];
  stocks: ResStockModel[];
  accountName: (id: number) => string;
}
export function SnapshotSales({ trades, stocks, accountName }: SalesProps) {
  return (
    <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
      <thead>
        <tr>
          {['종목', '기준통화', '연결계좌', '수량', '단가', '합산금액', '매도차익', '수익률(%)'].map((name) => (
            <th key={name}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => {
          const stock = stocks.find((value) => value.stockSeq === trade.stockSeq);
          if (!stock)
            return (
              <tr key={trade.tradeSeq}>
                <td colSpan={8}>종목 정보를 찾을 수 없습니다: {trade.stockSeq}</td>
              </tr>
            );
          const total = trade.quantity * trade.price;
          return (
            <tr key={trade.tradeSeq}>
              <td>{stock.name}</td>
              <td>{CurrencyProperties[stock.currency].name}</td>
              <td>{accountName(trade.accountSeq)}</td>
              <td className="right">{convertToComma(trade.quantity)}</td>
              <td className="right">{convertToCommaSymbol(trade.price, stock.currency)}</td>
              <td className="right">{convertToCommaSymbol(total, stock.currency)}</td>
              <td className="right">{printColorAmount(trade.sellGains, stock.currency)}</td>
              <td className="right">{printColorPercentage(portion(trade.sellGains, total - trade.sellGains))}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
