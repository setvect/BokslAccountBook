import { Button, ButtonGroup } from 'react-bootstrap';
import React, { useRef } from 'react';
import { ResExchangeModel } from '../../../../common/ResModel';
import { ExchangeKind } from '../../../../common/CommonType';
import { showDeleteDialog } from '../../util/util';
import IpcCaller from '../../../common/IpcCaller';
import ExchangeModal, { ExchangeModalHandle } from '../ExchangeModal';
import AccountMapper from '../../../mapper/AccountMapper';

interface ExchangeEditDeleteProps {
  exchange: ResExchangeModel;
  onReload: () => void;
}

function ExchangeEditDelete({ exchange, onReload }: ExchangeEditDeleteProps) {
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);
  const handleExchangeEditClick = (kind: ExchangeKind, exchangeSeq: number) => {
    exchangeModalRef.current?.openExchangeModal(kind, exchangeSeq, null);
  };
  const handleExchangeDeleteClick = async (exchangeSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteExchange(exchangeSeq);
      await AccountMapper.loadList();
      onReload();
      return true;
    });
  };

  return (
    <>
      <ButtonGroup size="sm">
        <Button onClick={() => handleExchangeEditClick(exchange.kind, exchange.exchangeSeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleExchangeDeleteClick(exchange.exchangeSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
      <ExchangeModal ref={exchangeModalRef} onSubmit={() => onReload()} />
    </>
  );
}

export default ExchangeEditDelete;
