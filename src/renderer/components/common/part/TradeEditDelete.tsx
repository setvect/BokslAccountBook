import { ResTradeModel } from '../../../../common/ResModel';
import { Button, ButtonGroup } from 'react-bootstrap';
import React, { useRef } from 'react';
import { TradeKind } from '../../../../common/CommonType';
import { showDeleteDialog } from '../../util/util';
import IpcCaller from '../../../common/IpcCaller';
import TradeModal, { TradeModalHandle } from '../TradeModal';
import StockBuyMapper from '../../../mapper/StockBuyMapper';
import AccountMapper from '../../../mapper/AccountMapper';

interface TradeEditDeleteProps {
  trade: ResTradeModel;
  onReload: () => void;
}

function TradeEditDelete({ trade, onReload }: TradeEditDeleteProps) {
  const tradeModalRef = useRef<TradeModalHandle>(null);
  const handleTradeEditClick = (kind: TradeKind, tradeSeq: number) => {
    tradeModalRef.current?.openTradeModal(kind, tradeSeq, null);
  };
  const handleTradeDeleteClick = async (tradeSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteTrade(tradeSeq);
      await StockBuyMapper.loadList();
      await AccountMapper.loadList();
      onReload();
      return true;
    });
  };

  return (
    <>
      <ButtonGroup size="sm">
        <Button onClick={() => handleTradeEditClick(trade.kind, trade.tradeSeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleTradeDeleteClick(trade.tradeSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
      <TradeModal ref={tradeModalRef} onSubmit={() => onReload()} />
    </>
  );
}

export default TradeEditDelete;
