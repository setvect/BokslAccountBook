import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Row } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import { Column, useSortBy, useTable } from 'react-table';
import { AccountType, AccountTypeProperties } from '../../common/RendererModel';
import { convertToComma, convertToCommaSymbol, downloadForTable, renderSortIndicator } from '../util/util';
import { Currency, TradeKind } from '../../../common/CommonType';
import { ResTradeModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import TradeCommon from '../common/part/TradeCommon';

export interface FinancialTradeListModalHandle {
  openModal: (type: AccountType, year: number, month: number, currency: Currency) => void;
}

const FinancialTradeListModal = forwardRef<FinancialTradeListModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);
  const [type, setType] = useState<AccountType>(AccountType.BUY);
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());
  const [currency, setCurrency] = useState<Currency>(Currency.KRW);

  useImperativeHandle(ref, () => ({
    openModal: async (kind: AccountType, year: number, month: number) => {
      setType(kind);
      setFrom(new Date(year, month - 1, 1));
      setTo(new Date(year, month, 0));
      setCurrency(currency);

      const searchCondition = {
        from: new Date(year, month - 1, 1),
        to: new Date(year, month, 0),
        checkType: new Set<AccountType>([kind]),
        currency,
      };

      const tradeList = await IpcCaller.getTradeList(searchCondition);
      setTradeList(tradeList);

      setShowModal(true);
    },
  }));

  const tableRef = useRef<HTMLTableElement>(null);

  const data = React.useMemo<ResTradeModel[]>(() => tradeList, [tradeList]);
  const columns: Column<ResTradeModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'kind', Cell: TradeCommon.renderType },
      { Header: '내용', accessor: 'note' },
      { Header: '종목', id: 'item', Cell: ({ row }) => StockMapper.getStock(row.original.stockSeq).name },
      { Header: '수량', accessor: 'quantity', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '단가',
        accessor: 'price',
        Cell: ({ row }) => convertToCommaSymbol(row.original.price, StockMapper.getStock(row.original.stockSeq).currency),
      },
      {
        Header: '합산금액',
        id: 'total',
        Cell: ({ row }) => convertToCommaSymbol(row.original.quantity * row.original.price, StockMapper.getStock(row.original.stockSeq).currency),
      },
      {
        Header: '매도차익',
        id: 'sellGains',
        Cell: ({ row }) =>
          row.original.kind === TradeKind.SELL
            ? convertToCommaSymbol(row.original.sellGains, StockMapper.getStock(row.original.stockSeq).currency)
            : '',
      },
      {
        Header: '손익률(%)',
        id: 'returnRate',
        Cell: ({ row }) => TradeCommon.renderReturnRate(row.original),
      },
      { Header: '거래세', accessor: 'tax', Cell: ({ value }) => convertToComma(value) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToComma(value) },
      { Header: '계좌', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getName(value) },
      { Header: '날짜', accessor: 'tradeDate', Cell: ({ value }) => moment(value).format('YYYY-MM-DD') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTradeModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const handleDownloadClick = () => {
    downloadForTable(
      tableRef,
      `${AccountTypeProperties[type].label}_내역_${moment(from).format('YYYY.MM.DD')}_${moment(to).format('YYYY.MM.DD')}.xls`,
    );
  };

  return (
    <Modal dialogClassName="modal-xl" show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {moment(from).format('YYYY.MM.DD')} ~ {moment(to).format('YYYY.MM.DD')} {AccountTypeProperties[type].label} 내역 (총:{' '}
          {convertToCommaSymbol(
            _.sumBy(tradeList, (trade) => trade.price * trade.quantity),
            currency,
          )}
          )
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <table
            ref={tableRef}
            {...getTableProps()}
            className="table-th-center table-font-size table table-dark table-striped table-bordered table-hover"
            style={{ marginTop: '10px' }}
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps((column as any).getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>{renderSortIndicator(column)}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return <tr {...row.getRowProps()}>{row.cells.map((cell) => TradeCommon.renderCell(cell))}</tr>;
              })}
            </tbody>
          </table>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={() => handleDownloadClick()}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
FinancialTradeListModal.displayName = 'FinancialTradeListModal';

export default FinancialTradeListModal;
