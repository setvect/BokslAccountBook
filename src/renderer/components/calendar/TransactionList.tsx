import { Button, ButtonGroup, Table } from 'react-bootstrap';
import React, { useEffect, useRef } from 'react';
import moment from 'moment/moment';
import { showDeleteDialog } from '../util/util';
import TransactionModal, { TransactionModalHandle } from '../common/TransactionModal';
import { TransactionKind } from '../../../common/CommonType';

interface TransactionListProps {
  onChange: () => void;
  selectDate: Date;
}

function TransactionList({ onChange, selectDate }: TransactionListProps) {
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const handleTransactionDeleteClick = (transactionSeq: number) => {
    showDeleteDialog(() => {
      console.log(`${transactionSeq}삭제`);
      onChange();
    });
  };

  const handleTransactionEditClick = (kind: TransactionKind, transactionSeq: number) => {
    transactionModalRef.current?.openTransactionModal(kind, transactionSeq, new Date());
  };

  useEffect(() => {
    console.log('TransactionList selectDate 날짜 변경', selectDate);
  }, [selectDate]);

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
          <tr>
            <td>
              <span className="account-spending">지출</span>
            </td>
            <td>교통비 &gt; 대중교통비</td>
            <td>전철비</td>
            <td className="right">$57.57</td>
            <td>[카드]복슬카드</td>
            <td>&nbsp;</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button onClick={() => handleTransactionEditClick(TransactionKind.SPENDING, 1)} className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button onClick={() => handleTransactionDeleteClick(1)} className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
          <tr>
            <td>
              <span className="account-income">수입</span>
            </td>
            <td>기타소득 &gt; 불로소득</td>
            <td>복권당첨</td>
            <td className="right">₩3,100,000,000</td>
            <td>&nbsp;</td>
            <td>복슬통장</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button onClick={() => handleTransactionEditClick(TransactionKind.INCOME, 1)} className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
          <tr>
            <td>
              <span className="account-transfer">이체</span>
            </td>
            <td>대체거래 &gt; 계좌이체</td>
            <td>카드값</td>
            <td className="right">₩1,000,000</td>
            <td>복슬통장</td>
            <td>복슬카드</td>
            <td style={{ textAlign: 'center' }}>
              <ButtonGroup size="sm">
                <Button onClick={() => handleTransactionEditClick(TransactionKind.TRANSFER, 1)} className="small-text-button" variant="secondary">
                  수정
                </Button>
                <Button className="small-text-button" variant="light">
                  삭제
                </Button>
              </ButtonGroup>
            </td>
          </tr>
        </tbody>
      </Table>
      <TransactionModal ref={transactionModalRef} />
    </>
  );
}

export default TransactionList;
