import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FavoriteForm, OptionNumberType, TransactionKind, TransactionKindProperties } from '../../common/BokslTypes';
import darkThemeStyles from '../../common/BokslConstant';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import CategoryMapper from '../../mapper/CategoryMapper';
import { getAccountOptionList } from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';

export interface FavoriteModalHandle {
  openFavoriteModal: (favoriteSeq: number, kind: TransactionKind, selectCallback: () => void) => void;
  hideFavoriteModal: () => void;
}

const FavoriteModal = forwardRef<FavoriteModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [kind, setKind] = useState<TransactionKind>(TransactionKind.SPENDING);
  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [categoryPath, setCategoryPath] = useState('');

  function createValidationSchema(kind: TransactionKind) {
    const schemaFields: any = {
      title: yup.string().required('거래제목은 필수입니다.'),
      categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
      kind: yup.mixed().oneOf(Object.values(TransactionKind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.'),
      money: yup.number().required('금액은 필수입니다.'),
      attribute: yup.string().required('속성은 필수입니다.'),
    };
    if (kind === TransactionKind.SPENDING) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (kind === TransactionKind.INCOME) {
      schemaFields.receiveAccount = yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0);
    } else if (kind === TransactionKind.TRANSFER) {
      schemaFields.payAccount = yup.number().test('is-not-zero', '지출 계좌를 선택해 주세요.', (value) => value !== 0);
      schemaFields.receiveAccount = yup.number().test('is-not-zero', '수입 계좌를 선택해 주세요.', (value) => value !== 0);
    }

    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema(kind);

  const [form, setForm] = useState<FavoriteForm>({
    favoriteSeq: 0,
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
    setValue,
  } = useForm<FavoriteForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openFavoriteModal: (favoriteSeq: number, kind: TransactionKind, callback: () => void) => {
      // TODO 값 불러오기
      // setForm(item);
      setForm({ ...form, favoriteSeq });
      setKind(kind);
      setParentCallback(() => callback);
      setShowModal(true);
      reset();
    },
    hideFavoriteModal: () => setShowModal(false),
  }));

  function clickCategory() {
    categoryModalRef.current?.openTransactionCategoryModal(CategoryMapper.getTransactionKindMapping(kind), (categorySeq: number) => {
      console.log(`callback @@ 선택: ${categorySeq}`);
      setValue('categorySeq', categorySeq);
      setCategoryPath(CategoryMapper.getCategoryPathText(categorySeq));
    });
  }

  const onSubmit = (data: FavoriteForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (form.categorySeq !== 0) {
      setCategoryPath(CategoryMapper.getCategoryPathText(form.categorySeq));
    }
  }, [form.categorySeq]);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>
            자주쓰는 {TransactionKindProperties[kind].label} 거래
            {form.favoriteSeq === 0 ? '등록' : '수정'}
          </Modal.Title>
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
                      <input type="hidden" {...register('categorySeq')} />
                      <Form.Control readOnly type="text" value={categoryPath} />
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
                          isDisabled={kind === TransactionKind.INCOME}
                          value={getAccountOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getAccountOptionList()}
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
                          isDisabled={kind === TransactionKind.SPENDING}
                          value={getAccountOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getAccountOptionList()}
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
                      {CodeMapper.getCodeSubOptionList(CodeMapper.getTransactionKindToCodeMapping(kind)).map((option) => (
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
