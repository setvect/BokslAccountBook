import { ResExchangeModel, ResTransactionModel } from '../../../../common/ResModel';
import { Button, ButtonGroup } from 'react-bootstrap';
import React, { useRef } from 'react';
import { TransactionKind } from '../../../../common/CommonType';
import { showDeleteDialog } from '../../util/util';
import IpcCaller from '../../../common/IpcCaller';
import TransactionModal, { TransactionModalHandle } from '../TransactionModal';

interface TransactionEditDeleteProps {
  transaction: ResTransactionModel;
  onReload: () => void;
}

function TransactionEditDelete(props: TransactionEditDeleteProps) {
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const handleTransactionEditClick = (kind: TransactionKind, transactionSeq: number) => {
    transactionModalRef.current?.openTransactionModal(kind, transactionSeq, null);
  };
  const handleTransactionDeleteClick = async (transactionSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteTransaction(transactionSeq);
      props.onReload();
      return true;
    });
  };

  return (
    <>
      <ButtonGroup size="sm">
        <Button
          onClick={() => handleTransactionEditClick(props.transaction.kind, props.transaction.transactionSeq)}
          className="small-text-button"
          variant="secondary"
        >
          수정
        </Button>
        <Button onClick={() => handleTransactionDeleteClick(props.transaction.transactionSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
      <TransactionModal ref={transactionModalRef} onSubmit={() => props.onReload()} />
    </>
  );
}

export default TransactionEditDelete;
