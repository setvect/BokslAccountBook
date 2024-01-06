import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { OptionNumberType, OptionStringType, TransactionKindProperties } from '../../common/RendererModel';
import 'react-datepicker/dist/react-datepicker.css';
import FavoriteList from './FavoriteList';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import CategoryMapper from '../../mapper/CategoryMapper';
import CodeMapper from '../../mapper/CodeMapper';
import AutoComplete from './AutoComplete';
import { getConfirmKey, getCurrencyOptionList, getReConfirmKey } from '../util/util';
import { ResFavoriteModel } from '../../../common/ResModel';
import { Currency, TransactionKind } from '../../../common/CommonType';
import { TransactionForm } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';

export interface TransactionModalHandle {
  openTransactionModal: (kind: TransactionKind, transactionSeq: number, selectDate: Date | null) => void;
  hideTransactionModal: () => void;
}

export interface TransactionModalProps {
  onSubmit: () => void;
}

const TransactionModal = forwardRef<TransactionModalHandle, TransactionModalProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [categoryPath, setCategoryPath] = useState('');
  const [kind, setKind] = useState<TransactionKind>(TransactionKind.SPENDING);

  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      transactionDate: yup.date().required('날짜는 필수입니다.'),
      categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
      kind: yup.mixed().oneOf(Object.values(TransactionKind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.'),
      amount: yup.number().required('금액은 필수입니다.'),
      currency: yup.string().required('통화는 필수입니다.'),
      attribute: yup.number().test('is-not-zero', '속성을 선택해 주세요.', (value) => value !== 0),
      fee: yup.number().required('수수료는 필수입니다.'),
    };

    if (kind === TransactionKind.SPENDING) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (kind === TransactionKind.INCOME) {
      schemaFields.receiveAccount = yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (kind === TransactionKind.TRANSFER) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
      schemaFields.receiveAccount = yup
        .number()
        .required('수입 계좌를 선택해 주세요.')
        .test('is-different-from-payAccount', '지출 계좌와 수입 계좌를 다르게 선택해 주세요.', (value, context) => {
          const { payAccount } = context.parent;
          return value !== payAccount;
        });
    }

    return yup.object().shape(schemaFields);
  };

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    trigger,
    watch,
  } = useForm<TransactionForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  const transactionSeq = watch('transactionSeq');
  const categorySeq = watch('categorySeq');
  const currency = watch('currency');

  useImperativeHandle(ref, () => ({
    openTransactionModal: async (kind: TransactionKind, transactionSeq: number, selectDate: Date | null) => {
      setShowModal(true);
      setCategoryPath('');

      // 기본값 설정(수정일 경우 비동기로 호출하기 때문에 기본값이 필요함)
      reset({
        transactionSeq: 0,
        transactionDate: selectDate === null ? new Date() : selectDate,
        categorySeq: 0,
        kind,
        note: '',
        currency: Currency.KRW,
        amount: 0,
        payAccount: 0,
        receiveAccount: 0,
        attribute: 0,
        fee: 0,
      });
      setKind(kind);

      if (transactionSeq !== 0) {
        const transactionModel = await IpcCaller.getTransaction(transactionSeq);
        reset({
          ...transactionModel,
          transactionDate: moment(transactionModel.transactionDate).toDate(),
        });
        setCategoryPath(CategoryMapper.getPathText(transactionModel.categorySeq));
        setKind(transactionModel.kind);
      }
    },
    hideTransactionModal: () => setShowModal(false),
  }));

  const changeTransactionDate = (diff: number) => {
    const currentDate = getValues('transactionDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('transactionDate', newDate);
  };

  const handleCategoryClick = () => {
    categoryModalRef.current?.openTransactionCategoryModal(TransactionKind.SPENDING, async (categorySeq: number) => {
      setValue('categorySeq', categorySeq);
      setCategoryPath(CategoryMapper.getPathText(categorySeq));
      await trigger('categorySeq');
    });
  };

  const onSubmit = async (data: TransactionForm, type: 'confirm' | 'reConfirm') => {
    if (data.transactionSeq === 0) {
      await IpcCaller.saveTransaction(data);
    } else {
      await IpcCaller.updateTransaction(data);
    }

    props.onSubmit();
    if (type === 'confirm') {
      setShowModal(false);
    } else {
      setValue('note', '');
      setValue('amount', 0);
      autoCompleteRef.current?.focus();
    }
  };

  function confirmInput() {
    handleSubmit((data) => onSubmit(data, 'confirm'))();
  }

  function confirmReInput() {
    handleSubmit((data) => onSubmit(data, 'reConfirm'))();
  }

  const handleConfirmClick = () => {
    confirmInput();
  };
  const handleConfirmReInputClick = () => {
    confirmReInput();
  };
  const handleCategorySelect = async (categorySeq: number) => {
    setValue('categorySeq', categorySeq);
    setCategoryPath(CategoryMapper.getPathText(categorySeq));
    await trigger('categorySeq');
  };

  const handleSelectFavorite = (favorite: ResFavoriteModel) => {
    console.log('handleSelectFavorite', favorite);
    console.log('favorite.categorySeq', favorite.categorySeq);
    setValue('note', favorite.note);
    setValue('categorySeq', favorite.categorySeq);
    // setForm({ ...form, categorySeq: favorite.categorySeq });
    setCategoryPath(CategoryMapper.getPathText(favorite.categorySeq));
    setValue('currency', favorite.currency);
    setValue('amount', favorite.amount);
    setValue('payAccount', favorite.payAccount);
    setValue('receiveAccount', favorite.receiveAccount);
    setValue('attribute', favorite.attribute);
  };
  const handleShortKeyPress = (event: KeyboardEvent) => {
    const isCmdOrCtrl = event.metaKey || event.ctrlKey;
    const isShift = event.shiftKey;
    const isEnter = event.key === 'Enter';

    if (isCmdOrCtrl && isShift && isEnter) {
      console.log('단축키 조합이 눌렸습니다.');
      if (transactionSeq === 0) {
        confirmReInput();
      }
    } else if (isCmdOrCtrl && isEnter) {
      console.log('단축키 조합이 눌렸습니다.');
      confirmInput();
    }
  };

  useEffect(
    () => {
      const handleKeyPressEvent = (event: KeyboardEvent) => handleShortKeyPress(event);

      if (showModal) {
        autoCompleteRef.current?.focus();
        if (categorySeq !== 0) {
          setCategoryPath(CategoryMapper.getPathText(categorySeq));
        }
        window.addEventListener('keydown', handleKeyPressEvent);
      }

      return () => {
        window.removeEventListener('keydown', handleKeyPressEvent);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showModal],
  );

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>
            {TransactionKindProperties[kind].label} 내역 {transactionSeq === 0 ? '등록' : '수정'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    날짜
                  </Form.Label>
                  <Col sm={10}>
                    <Row>
                      <Col sm={8}>
                        <div className="form-group">
                          <Controller
                            control={control}
                            name="transactionDate"
                            render={({ field }) => (
                              <DatePicker dateFormat="yyyy-MM-dd" onChange={field.onChange} selected={field.value} className="form-control" />
                            )}
                          />
                          {errors.transactionDate && (
                            <span className="error" style={{ display: 'block' }}>
                              {errors.transactionDate.message}
                            </span>
                          )}
                        </div>
                      </Col>
                      <Col>
                        <Button variant="outline-success" onClick={() => changeTransactionDate(-1)}>
                          전날
                        </Button>
                        <Button variant="outline-success" style={{ marginLeft: '5px' }} onClick={() => changeTransactionDate(1)}>
                          다음날
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    메모
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="note"
                      render={({ field }) => (
                        <AutoComplete
                          value={field.value}
                          kind={kind}
                          onChange={(newValue) => field.onChange(newValue)}
                          onCategorySelect={(categorySeq) => handleCategorySelect(categorySeq)}
                          ref={autoCompleteRef}
                        />
                      )}
                    />
                    {errors.note && <span className="error">{errors.note.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    분류
                  </Form.Label>
                  <Col sm={10}>
                    <InputGroup>
                      <input type="hidden" {...register('categorySeq')} />
                      <Form.Control readOnly type="text" value={categoryPath} />
                      <Button variant="outline-secondary" onClick={() => handleCategoryClick()}>
                        선택
                      </Button>
                    </InputGroup>
                    {errors.categorySeq && <span className="error">{errors.categorySeq.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    거래 통화
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          value={getCurrencyOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptionList()}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
                    />
                    {errors.currency && <span className="error">{errors.currency.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    금액
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator
                          maxLength={12}
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          className="form-control"
                          style={{ textAlign: 'right' }}
                        />
                      )}
                    />
                    {errors.amount && <span className="error">{errors.amount.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    지출계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="payAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          isDisabled={kind === TransactionKind.INCOME}
                          value={AccountMapper.getOptionBalanceList(currency).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getOptionBalanceList(currency)}
                          placeholder="계좌 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
                    />
                    {errors.payAccount && <span className="error">{errors.payAccount.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    수입계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="receiveAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          isDisabled={kind === TransactionKind.SPENDING}
                          value={AccountMapper.getOptionBalanceList(currency).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getOptionBalanceList(currency)}
                          placeholder="계좌 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
                    />
                    {errors.receiveAccount && <span className="error">{errors.receiveAccount.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    속성
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="attribute"
                      render={({ field }) => {
                        const optionList = CodeMapper.getSubOptionList(CodeMapper.getTransactionKindToCodeMapping(kind));
                        return (
                          <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                            value={optionList.find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option?.value)}
                            options={optionList}
                            placeholder="속성 성택"
                            className="react-select-container"
                            styles={darkThemeStyles}
                          />
                        );
                      }}
                    />
                    {errors.attribute && <span className="error">{errors.attribute.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    수수료
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="fee"
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator
                          maxLength={8}
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          className="form-control"
                          style={{ textAlign: 'right' }}
                        />
                      )}
                    />
                    {errors.fee && <span className="error">{errors.fee.message}</span>}
                  </Col>
                </Form.Group>
              </Form>
            </Col>
            <Col>
              <FavoriteList kind={kind} onSelectFavorite={(favorite) => handleSelectFavorite(favorite)} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          {transactionSeq === 0 && (
            <Button variant="primary" onClick={handleConfirmReInputClick}>
              저장후 다시입력({getReConfirmKey()})
            </Button>
          )}
          <Button variant="primary" onClick={handleConfirmClick}>
            저장({getConfirmKey()})
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <TransactionCategoryModal ref={categoryModalRef} />
    </>
  );
});
TransactionModal.displayName = 'TransactionModal';

export default TransactionModal;
