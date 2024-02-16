import { Button, ButtonGroup } from 'react-bootstrap';
import React, { useRef } from 'react';
import { ResTransactionModel } from '../../../../common/ResModel';
import { TransactionKind } from '../../../../common/CommonType';
import { showDeleteDialog } from '../../util/util';
import IpcCaller from '../../../common/IpcCaller';
import TransactionModal, { TransactionModalHandle } from '../TransactionModal';
import AccountMapper from '../../../mapper/AccountMapper';

interface TransactionEditDeleteProps {
  transaction: ResTransactionModel;
  onReload: () => void;
}

function TransactionEditDelete({ transaction, onReload }: TransactionEditDeleteProps) {
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const handleTransactionEditClick = (kind: TransactionKind, transactionSeq: number) => {
    transactionModalRef.current?.openTransactionModal(kind, transactionSeq, null);
  };
  const handleTransactionDeleteClick = async (transactionSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteTransaction(transactionSeq);
      await AccountMapper.loadList();
      onReload();
      return true;
    });
  };

  return (
    <>
      <ButtonGroup size="sm">
        <Button
          onClick={() => handleTransactionEditClick(transaction.kind, transaction.transactionSeq)}
          className="small-text-button"
          variant="secondary"
        >
          수정
        </Button>
        <Button onClick={() => handleTransactionDeleteClick(transaction.transactionSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
      <TransactionModal ref={transactionModalRef} onSubmit={() => onReload()} />
    </>
  );
}

export default TransactionEditDelete;
