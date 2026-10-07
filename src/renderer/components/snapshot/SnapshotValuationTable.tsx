import { Table } from 'react-bootstrap';
import { GroupValuation, Valuation, portion } from '../../../common/calculation/snapshotReport';
import { convertToCommaDecimal, convertToPercentage, printColorAmount, printColorPercentage } from '../util/util';

interface Props {
  title: string;
  rows: GroupValuation[];
  totals: Valuation;
  name: (code: number) => string;
}
export default function SnapshotValuationTable({ title, rows, totals, name }: Props) {
  return (
    <section className="mb-3">
      <h5>{title}</h5>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>구분</th>
            <th>합산금액</th>
            <th>평가금액</th>
            <th>수익금</th>
            <th>수익률</th>
            <th>합산금액 비중(%)</th>
            <th>평가금액 비중(%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              <td>{name(row.code)}</td>
              <td className="right">{convertToCommaDecimal(row.buyAmount, 0)}</td>
              <td className="right">{convertToCommaDecimal(row.evaluateAmount, 0)}</td>
              <td className="right">{printColorAmount(Math.round(row.profit))}</td>
              <td className="right">{printColorPercentage(row.profitRate)}</td>
              <td className="right">{convertToPercentage(portion(row.buyAmount, totals.buyAmount))}</td>
              <td className="right">{convertToPercentage(portion(row.evaluateAmount, totals.evaluateAmount))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>합계</td>
            <td className="right">{convertToCommaDecimal(totals.buyAmount, 0)}</td>
            <td className="right">{convertToCommaDecimal(totals.evaluateAmount, 0)}</td>
            <td className="right">{printColorAmount(Math.round(totals.profit))}</td>
            <td className="right">{printColorPercentage(totals.profitRate)}</td>
            <td colSpan={2}>-</td>
          </tr>
        </tfoot>
      </Table>
    </section>
  );
}
