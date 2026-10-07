import { Table } from 'react-bootstrap';
import { Currency } from '../../../common/CommonType';
import { Valuation, ValueComparison } from '../../../common/calculation/snapshotReport';
import { convertToCommaSymbol, convertToPercentage, printColorAmount } from '../util/util';

export interface ComparisonRow {
  id: number;
  label: string;
  currency: Currency;
  detail: string;
  values: ValueComparison<Valuation>;
}
interface Props {
  title: string;
  rows: ComparisonRow[];
}
function ValueCells({ value, currency }: { value: Valuation | undefined; currency: Currency }) {
  return (
    <>
      <td className="right">{value ? convertToCommaSymbol(value.buyAmount, currency) : '-'}</td>
      <td className="right">{value ? convertToCommaSymbol(value.evaluateAmount, currency) : '-'}</td>
      <td className="right">{value ? convertToCommaSymbol(value.profit, currency) : '-'}</td>
      <td className="right">{value ? convertToPercentage(value.profitRate) : '-'}</td>
    </>
  );
}
export default function SnapshotComparisonTable({ title, rows }: Props) {
  return (
    <section className="mb-4">
      <h5>{title}</h5>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th rowSpan={2}>구분</th>
            <th colSpan={4}>이전</th>
            <th colSpan={4}>현재</th>
            <th colSpan={3}>변화</th>
          </tr>
          <tr>
            {['이전', '현재'].flatMap((period) =>
              ['매수·합산금액', '평가금액', '수익금', '수익률'].map((label) => <th key={`${period}-${label}`}>{label}</th>),
            )}
            <th>매수·합산금액</th>
            <th>평가금액</th>
            <th>수익금</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.label}
                {row.detail && <div className="text-muted">{row.detail}</div>}
              </td>
              <ValueCells value={row.values.before} currency={row.currency} />
              <ValueCells value={row.values.after} currency={row.currency} />
              <td className="right">{printColorAmount(row.values.change.buyAmount, row.currency)}</td>
              <td className="right">{printColorAmount(row.values.change.evaluateAmount, row.currency)}</td>
              <td className="right">{printColorAmount(row.values.change.profit, row.currency)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
