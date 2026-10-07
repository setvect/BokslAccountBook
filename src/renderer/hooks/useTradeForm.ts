import { ForwardedRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TradeKind, Currency } from '../../common/CommonType';
import { ReqTradeModel } from '../../common/ReqModel';
import IpcCaller from '../common/IpcCaller';
import KeyEventChecker from '../common/KeyEventChecker';
import StockMapper from '../mapper/StockMapper';
import { newTrade, tradeFormSchema, tradeToForm } from '../forms/ledgerForms';
import { LedgerModalProps, TradeModalHandle } from '../forms/ledgerModalTypes';
import useModalSession from './useModalSession';
import useWindowKeydown from './useWindowKeydown';

export default function useTradeForm(props: LedgerModalProps, ref: ForwardedRef<TradeModalHandle>) {
  const modal = useModalSession();
  const shortcutRef = useRef<HTMLDivElement>(null);
  const form = useForm<ReqTradeModel>({ resolver: yupResolver(tradeFormSchema), mode: 'onBlur', defaultValues: newTrade(TradeKind.BUY, null) });
  const { reset, watch, getValues, setValue, setFocus, handleSubmit } = form;
  const tradeSeq = watch('tradeSeq');
  const kind = watch('kind');
  const accountSeq = watch('accountSeq');
  const stockSeq = watch('stockSeq');
  const price = watch('price');
  const quantity = watch('quantity');
  const currency = stockSeq ? StockMapper.getStock(stockSeq).currency : Currency.KRW;
  useImperativeHandle(ref, () => ({
    openTradeModal: (requestedKind, seq, date) => {
      modal.open(
        () => reset(newTrade(requestedKind, date)),
        seq ? () => IpcCaller.getTrade(seq) : undefined,
        (model) => reset(tradeToForm(model)),
      );
    },
    hideTradeModal: modal.close,
  }));
  const changeTradeDate = (diff: number) => {
    const date = new Date(getValues('tradeDate'));
    date.setDate(date.getDate() + diff);
    setValue('tradeDate', date);
  };
  const handleConfirmClick = () => {
    modal.submit(async (isCurrent) => {
      await handleSubmit(async (data) => {
        if (!isCurrent()) return;
        if (data.tradeSeq === 0) await IpcCaller.saveTrade(data);
        else await IpcCaller.updateTrade(data);
        if (isCurrent()) modal.close();

        props.onSubmit();
      })();
    });
  };
  useWindowKeydown(
    modal.show && !modal.disabled,
    (event) => {
      if (KeyEventChecker.isCmdOrCtrl(event) && KeyEventChecker.isEnter(event)) {
        event.preventDefault();
        handleConfirmClick();
      }
    },
    shortcutRef,
  );
  useEffect(() => {
    if (modal.show && modal.ready) setFocus('note');
  }, [modal.show, modal.ready, setFocus]);
  return {
    shortcutRef,
    ...form,
    errors: form.formState.errors,
    modal,
    tradeSeq,
    kind,
    accountSeq,
    changeTradeDate,
    handleConfirmClick,
    stockSeq,
    price,
    quantity,
    currency,
  };
}
