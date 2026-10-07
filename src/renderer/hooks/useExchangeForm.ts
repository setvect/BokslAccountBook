import { ForwardedRef, useEffect, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ExchangeKind } from '../../common/CommonType';
import { ReqExchangeModel } from '../../common/ReqModel';
import IpcCaller from '../common/IpcCaller';
import KeyEventChecker from '../common/KeyEventChecker';
import AccountMapper from '../mapper/AccountMapper';
import { newExchange, exchangeFormSchema, exchangeToForm } from '../forms/ledgerForms';
import { LedgerModalProps, ExchangeModalHandle } from '../forms/ledgerModalTypes';
import useModalSession from './useModalSession';
import useWindowKeydown from './useWindowKeydown';

export default function useExchangeForm(props: LedgerModalProps, ref: ForwardedRef<ExchangeModalHandle>) {
  const modal = useModalSession();
  const form = useForm<ReqExchangeModel>({
    resolver: yupResolver(exchangeFormSchema),
    mode: 'onBlur',
    defaultValues: newExchange(ExchangeKind.EXCHANGE_BUY, null),
  });
  const { reset, watch, getValues, setValue, setFocus, handleSubmit } = form;
  const exchangeSeq = watch('exchangeSeq');
  const kind = watch('kind');
  const accountSeq = watch('accountSeq');

  useImperativeHandle(ref, () => ({
    openExchangeModal: (requestedKind, seq, date) => {
      modal.open(
        () => reset(newExchange(requestedKind, date)),
        seq ? () => IpcCaller.getExchange(seq) : undefined,
        (model) => reset(exchangeToForm(model)),
      );
    },
    hideExchangeModal: modal.close,
  }));
  const changeExchangeDate = (diff: number) => {
    const date = new Date(getValues('exchangeDate'));
    date.setDate(date.getDate() + diff);
    setValue('exchangeDate', date);
  };
  const handleConfirmClick = () => {
    modal.submit(async (isCurrent) => {
      await handleSubmit(async (data) => {
        if (!isCurrent()) return;
        if (data.exchangeSeq === 0) await IpcCaller.saveExchange(data);
        else await IpcCaller.updateExchange(data);
        if (isCurrent()) modal.close();

        await AccountMapper.loadList();
        props.onSubmit();
      })();
    });
  };
  useWindowKeydown(modal.show && !modal.disabled, (event) => {
    if (KeyEventChecker.isCmdOrCtrl(event) && KeyEventChecker.isEnter(event)) {
      event.preventDefault();
      handleConfirmClick();
    }
  });
  useEffect(() => {
    if (modal.show && modal.ready) setFocus('note');
  }, [modal.show, modal.ready, setFocus]);
  return { ...form, errors: form.formState.errors, modal, exchangeSeq, kind, accountSeq, changeExchangeDate, handleConfirmClick };
}
