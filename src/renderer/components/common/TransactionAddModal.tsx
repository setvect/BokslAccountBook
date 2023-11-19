import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AccountType, Kind, OptionType, TransactionModalForm } from './BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import FavoriteList from './FavoriteList';
import CategoryModal, { CategoryModalHandle } from './CategoryModal';
import darkThemeStyles from './BokslConstant';

export interface TransactionAddModalHandle {
  openTransactionModal: (type: AccountType, item: TransactionModalForm, saveCallback: () => void) => void;
  hideTransactionModal: () => void;
}

const TransactionAddModal = forwardRef<TransactionAddModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<AccountType>(AccountType.INCOME);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<TransactionModalForm>({
    transactionDate: new Date(),
    categorySeq: 0,
    kind: Kind.INCOME,
    note: '안녕',
    money: 0,
    payAccount: 0,
    receiveAccount: 3,
    attribute: '2',
    fee: 10,
  });

  const categoryModalRef = useRef<CategoryModalHandle>(null);

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema(typeAtt: AccountType) {
    const schemaFields: any = {
      // categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
      kind: yup.mixed().oneOf(Object.values(Kind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.'),
      money: yup.number().required('금액은 필수입니다.'),
      attribute: yup.string().required('속성은 필수입니다.'),
      fee: yup.number().required('수수료는 필수입니다.'),
    };

    if (typeAtt === AccountType.EXPENSE) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (typeAtt === AccountType.INCOME) {
      schemaFields.receiveAccount = yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (typeAtt === AccountType.TRANSFER) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
      schemaFields.receiveAccount = yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0);
    }

    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema(type);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<TransactionModalForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  const { ref: inputRef, ...rest } = register('note');

  useImperativeHandle(ref, () => ({
    openTransactionModal: (t: AccountType, item: TransactionModalForm, callback: () => void) => {
      setShowModal(true);
      setForm(item);
      setType(t);
      setParentCallback(() => callback);
      reset();
    },
    hideTransactionModal: () => setShowModal(false),
  }));

  const options = [
    { value: 1, label: '계좌 1' },
    { value: 2, label: '계좌 2' },
    { value: 3, label: '계좌 3' },
  ];

  const options1 = [
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' },
    { value: '3', label: '옵션 3' },
  ];

  function changeTransactionDate(diff: number) {
    const currentDate = getValues('transactionDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('transactionDate', newDate);
  }

  function clickCategory() {
    categoryModalRef.current?.openCategoryModal(1, () => {
      console.log('callback');
    });
  }

  const onSubmit = (data: TransactionModalForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const input = document.getElementById('transactionNote');
    input?.focus();
  }, []);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="modal-xl" centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>지출 내역 등록 {type}</Modal.Title>
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
                          {errors.transactionDate && <div>{errors.transactionDate.message}</div>}
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
                    분류
                  </Form.Label>
                  <Col sm={10}>
                    <InputGroup>
                      <Form.Control readOnly type="text" {...register('categorySeq')} />
                      <Button variant="outline-secondary" onClick={() => clickCategory()}>
                        선택
                      </Button>
                    </InputGroup>
                    {errors.categorySeq && <span className="error">{errors.categorySeq.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    메모
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control type="text" id="transactionNote" {...register('note')} />
                    {errors.note && <span className="error">{errors.note.message}</span>}
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
                        <Select<OptionType, false, GroupBase<OptionType>>
                          value={options.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={options}
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
                        <Select<OptionType, false, GroupBase<OptionType>>
                          isDisabled
                          value={options.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={options}
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
                    <Form.Select {...register('attribute')}>
                      {options1.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
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
              <FavoriteList />
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
      <CategoryModal ref={categoryModalRef} />
    </>
  );
});
TransactionAddModal.displayName = 'TransactionAddModal';

export default TransactionAddModal;
