import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FavoriteForm, TransactionKind, OptionNumberType } from '../../type/BokslTypes';
import darkThemeStyles from '../../type/BokslConstant';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';

export interface FavoriteModalHandle {
  openFavoriteModal: (favoriteSeq: number, selectCallback: () => void) => void;
  hideFavoriteModal: () => void;
}

const FavoriteModal = forwardRef<FavoriteModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});

  const validationSchema = yup.object().shape({
    title: yup.string().required('거래제목은 필수입니다.'),
    categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
    kind: yup.mixed().oneOf(Object.values(TransactionKind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
    note: yup.string().required('메모는 필수입니다.'),
    money: yup.number().required('금액은 필수입니다.'),
    payAccount: yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0),
    receiveAccount: yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0),
    attribute: yup.string().required('속성은 필수입니다.'),
  });

  const [form, setForm] = useState<FavoriteForm>({
    title: '',
    categorySeq: 0,
    kind: TransactionKind.INCOME,
    note: '',
    money: 0,
    payAccount: 0,
    receiveAccount: 0,
    attribute: '',
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FavoriteForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

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

  useImperativeHandle(ref, () => ({
    openFavoriteModal: (favoriteSeq: number, callback: () => void) => {
      console.log('openModal');
      setParentCallback(() => callback);
      setShowModal(true);
      reset();
    },
    hideFavoriteModal: () => setShowModal(false),
  }));
  function clickCategory() {
    categoryModalRef.current?.openTransactionCategoryModal(1, () => {
      console.log('callback');
    });
  }
  const onSubmit = (data: FavoriteForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {});

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>자주쓰는 거래</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    거래제목
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control {...register('title')} />
                    {errors.title && <span className="error">{errors.title.message}</span>}
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
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    메모
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control type="text" {...register('note')} />
                    {errors.note && <span className="error">{errors.note.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
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
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    지출계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="payAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
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
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    수입계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Controller
                      control={control}
                      name="receiveAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
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
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
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
              </Form>
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
FavoriteModal.displayName = 'FavoriteModal';

export default FavoriteModal;
