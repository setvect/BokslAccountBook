import { ForwardedRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TransactionKind } from '../../common/CommonType';
import { ReqTransactionModel } from '../../common/ReqModel';
import { ResFavoriteModel } from '../../common/ResModel';
import IpcCaller from '../common/IpcCaller';
import KeyEventChecker from '../common/KeyEventChecker';
import CategoryMapper from '../mapper/CategoryMapper';
import { TransactionCategoryModalHandle } from '../components/common/TransactionCategoryModal';
import { newTransaction, transactionFormSchema, transactionToForm } from '../forms/ledgerForms';
import { LedgerModalProps, TransactionModalHandle } from '../forms/ledgerModalTypes';
import useModalSession from './useModalSession';
import useWindowKeydown from './useWindowKeydown';

export default function useTransactionForm(props: LedgerModalProps, ref: ForwardedRef<TransactionModalHandle>) {
  const modal = useModalSession();
  const shortcutRef = useRef<HTMLDivElement>(null);
  const form = useForm<ReqTransactionModel>({
    resolver: yupResolver(transactionFormSchema),
    mode: 'onBlur',
    defaultValues: newTransaction(TransactionKind.SPENDING, null),
  });
  const { reset, watch, getValues, setValue, trigger, handleSubmit } = form;
  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const kind = watch('kind');
  const transactionSeq = watch('transactionSeq');
  const currency = watch('currency');
  const categorySeq = watch('categorySeq');
  const categoryPath = categorySeq ? CategoryMapper.getPathText(categorySeq) : '';
  useImperativeHandle(ref, () => ({
    openTransactionModal: (requestedKind, seq, date) => {
      modal.open(
        () => reset(newTransaction(requestedKind, date)),
        seq ? () => IpcCaller.getTransaction(seq) : undefined,
        (model) => reset(transactionToForm(model)),
      );
    },
    hideTransactionModal: modal.close,
  }));
  const changeTransactionDate = (diff: number) => {
    const date = new Date(getValues('transactionDate'));
    date.setDate(date.getDate() + diff);
    setValue('transactionDate', date);
  };
  const submit = (again: boolean) =>
    modal.submit(async (isCurrent) => {
      await handleSubmit(async (data) => {
        if (!isCurrent()) return;
        if (data.transactionSeq === 0) await IpcCaller.saveTransaction(data);
        else await IpcCaller.updateTransaction(data);
        // Mark successful writes before refresh: a failed refresh must not offer the same write again.
        if (isCurrent()) {
          if (again && data.transactionSeq === 0) {
            setValue('note', '');
            setValue('amount', 0);
            autoCompleteRef.current?.focus();
          } else modal.close();
        }

        props.onSubmit();
      })();
    });
  const handleConfirmClick = () => {
    submit(false);
  };
  const handleConfirmReInputClick = () => {
    submit(true);
  };
  const handleCategorySelect = async (seq: number) => {
    setValue('categorySeq', seq);
    await trigger('categorySeq');
  };
  const handleSelectFavorite = (favorite: ResFavoriteModel) => {
    setValue('note', favorite.note ?? '');
    setValue('categorySeq', favorite.categorySeq);
    setValue('currency', favorite.currency);
    setValue('amount', favorite.amount ?? 0);
    setValue('payAccount', favorite.payAccount ?? 0);
    setValue('receiveAccount', favorite.receiveAccount ?? 0);
    setValue('attribute', favorite.attribute ?? 0);
  };
  useWindowKeydown(
    modal.show && !modal.disabled,
    (event) => {
      if (KeyEventChecker.isCmdOrCtrl(event) && KeyEventChecker.isEnter(event)) {
        event.preventDefault();
        if (event.shiftKey) {
          if (transactionSeq === 0) handleConfirmReInputClick();
        } else handleConfirmClick();
      }
    },
    shortcutRef,
  );
  useEffect(() => {
    if (modal.show && modal.ready) autoCompleteRef.current?.focus();
  }, [modal.show, modal.ready]);
  return {
    shortcutRef,
    ...form,
    errors: form.formState.errors,
    modal,
    categoryPath,
    kind,
    transactionSeq,
    currency,
    categoryModalRef,
    autoCompleteRef,
    changeTransactionDate,
    handleCategoryClick: () => categoryModalRef.current?.openTransactionCategoryModal(kind),
    handleCategorySelect,
    handleOnSelect: handleCategorySelect,
    handleSelectFavorite,
    handleConfirmClick,
    handleConfirmReInputClick,
  };
}
