import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OptionNumberType, TransactionForm, TransactionKind, TransactionKindProperties } from '../../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import FavoriteList from './FavoriteList';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import darkThemeStyles from '../../common/BokslConstant';
import AccountMapper from '../../mapper/AccountMapper';
import CategoryMapper, { CategoryKind } from '../../mapper/CategoryMapper';
import CodeMapper from '../../mapper/CodeMapper';
import AutoComplete from './AutoComplete';

export interface TransactionModalHandle {
  openTransactionModal: (kind: TransactionKind, transactionSeq: number, saveCallback: () => void) => void;
  hideTransactionModal: () => void;
}

const TransactionModal = forwardRef<TransactionModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [kind, setKind] = useState<TransactionKind>(TransactionKind.SPENDING);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<TransactionForm>({
    transactionSeq: 0,
    transactionDate: new Date(),
    categorySeq: 0,
    kind: TransactionKind.INCOME,
    note: '안녕',
    money: 0,
    payAccount: 1,
    receiveAccount: 1,
    attribute: 1,
    fee: 10,
  });
  const [categoryPath, setCategoryPath] = useState('');

  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema(kind: TransactionKind) {
    const schemaFields: any = {
      transactionDate: yup.string().required('날짜는 필수입니다.'),
      categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
      kind: yup.mixed().oneOf(Object.values(TransactionKind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.'),
      money: yup.number().required('금액은 필수입니다.'),
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
  }

  const validationSchema = createValidationSchema(kind);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
    trigger,
  } = useForm<TransactionForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openTransactionModal: (t: TransactionKind, transactionSeq: number, callback: () => void) => {
      setShowModal(true);
      // TODO 값 불러오기
      // reset(item);
      reset({ ...form, transactionSeq });
      setKind(t);
      setParentCallback(() => callback);
    },
    hideTransactionModal: () => setShowModal(false),
  }));

  function changeTransactionDate(diff: number) {
    const currentDate = getValues('transactionDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('transactionDate', newDate);
  }

  function handleCategoryClick() {
    categoryModalRef.current?.openTransactionCategoryModal(CategoryKind.SPENDING, (categorySeq: number) => {
      setValue('categorySeq', categorySeq);
      setCategoryPath(CategoryMapper.getCategoryPathText(categorySeq));
      trigger('categorySeq');
    });
  }

  const onSubmit = (data: TransactionForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };
  const handleCategorySelect = (categorySeq: number) => {
    setValue('categorySeq', categorySeq);
    setCategoryPath(CategoryMapper.getCategoryPathText(categorySeq));
    trigger('categorySeq');
  };

  useEffect(
    () => {
      if (!showModal) {
        return;
      }
      autoCompleteRef.current?.focus();
      if (form.categorySeq !== 0) {
        setCategoryPath(CategoryMapper.getCategoryPathText(form.categorySeq));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showModal],
  );

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>
            {TransactionKindProperties[kind].label} 내역 {form.transactionSeq === 0 ? '등록' : '수정'}
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
                    <AutoComplete
                      value={form.note}
                      kind={kind}
                      onChange={(newValue) => setValue('note', newValue)}
                      onCategorySelect={(categorySeq) => handleCategorySelect(categorySeq)}
                      ref={autoCompleteRef}
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
                    금액
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="money"
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
                    {errors.money && <span className="error">{errors.money.message}</span>}
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
                          value={AccountMapper.getAccountOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getAccountOptionList()}
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
                          value={AccountMapper.getAccountOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getAccountOptionList()}
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
                        const optionList = CodeMapper.getCodeSubOptionList(CodeMapper.getTransactionKindToCodeMapping(kind));
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
              <FavoriteList kind={kind} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          <Button variant="primary" onClick={handleConfirmClick}>
            저장
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
