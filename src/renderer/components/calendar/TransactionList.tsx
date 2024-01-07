import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment/moment';
import { convertToCommaSymbol } from '../util/util';
import { ResSearchModel, ResTransactionModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';
import { AccountType, TransactionKindProperties } from '../../common/RendererModel';
import CategoryMapper from '../../mapper/CategoryMapper';
import AccountMapper from '../../mapper/AccountMapper';
import TransactionEditDelete from '../common/part/TransactionEditDelete';

interface TransactionListProps {
  onChange: () => void;
  selectDate: Date;
  forceReload: boolean;
}

function TransactionList({ onChange, selectDate, forceReload }: TransactionListProps) {
  const [transactionList, setTransactionList] = useState<ResTransactionModel[]>([]);

  const reload = async () => {
    const searchMode: ResSearchModel = {
      from: selectDate,
      to: selectDate,
      checkType: new Set([AccountType.SPENDING, AccountType.INCOME, AccountType.TRANSFER]),
    };
    const list = await IpcCaller.getTransactionList(searchMode);
    setTransactionList(list);
  };

  useEffect(() => {
    (async () => await reload())();
  }, [selectDate, forceReload]);

  return (
    <>
      <h4>{moment(selectDate).format('YYYY년 MM월 DD일')} 내역</h4>
      <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
        <thead>
          <tr>
            <th>유형</th>
            <th>분류</th>
            <th>내용</th>
            <th>금액</th>
            <th>출금계좌</th>
            <th>입금계좌</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          {transactionList.map((transaction) => {
            const kindProperty = TransactionKindProperties[transaction.kind];
            return (
              <tr key={transaction.transactionSeq}>
                <td>
                  <span className={kindProperty.color}>{kindProperty.label}</span>
                </td>
                <td>{CategoryMapper.getPathText(transaction.categorySeq)}</td>
                <td>{transaction.note}</td>
                <td className="right">{convertToCommaSymbol(transaction.amount, transaction.currency)}</td>
                <td>{transaction.payAccount ? AccountMapper.getName(transaction.payAccount) : '-'}</td>
                <td>{transaction.receiveAccount ? AccountMapper.getName(transaction.receiveAccount) : '-'}</td>
                <td className="center">
                  <TransactionEditDelete
                    transaction={transaction}
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

export default TransactionList;
