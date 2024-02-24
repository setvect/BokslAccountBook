import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OptionNumberType, OptionStringType, TransactionKindProperties } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import CategoryMapper from '../../mapper/CategoryMapper';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import { getCurrencyOptions } from '../util/util';
import { Currency, TransactionKind } from '../../../common/CommonType';
import { ReqFavoriteModel } from '../../../common/ReqModel';
import FavoriteMapper from '../../mapper/FavoriteMapper';
import IpcCaller from '../../common/IpcCaller';

export interface FavoriteModalHandle {
  openFavoriteModal: (favoriteSeq: number) => void;
  hideFavoriteModal: () => void;
}

export interface FavoriteModalProps {
  onSubmit: () => void;
  kind: TransactionKind;
}

const FavoriteModal = forwardRef<FavoriteModalHandle, FavoriteModalProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);
  const [categoryPath, setCategoryPath] = useState('');

  const createValidationSchema = (kind: TransactionKind) => {
    const schemaFields: any = {
      title: yup.string().required('거래제목은 필수입니다.'),
      categorySeq: yup.number().test('is-not-zero', '분류를 선택해 주세요.', (value) => value !== 0),
      kind: yup.mixed().oneOf(Object.values(TransactionKind), '유효한 유형이 아닙니다').required('유형은 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.'),
      currency: yup.string().required('거래 통화는 필수입니다.'),
      amount: yup.number().required('금액은 필수입니다.'),
      attribute: yup.number().test('is-not-zero', '속성을 선택해 주세요.', (value) => value !== 0),
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
  };

  const validationSchema = createValidationSchema(props.kind);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
  } = useForm<ReqFavoriteModel>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });
  const favoriteSeq = watch('favoriteSeq');
  const categorySeq = watch('categorySeq');

  useImperativeHandle(ref, () => ({
    openFavoriteModal: (favoriteSeq: number) => {
      setShowModal(true);

      if (favoriteSeq === 0) {
        reset({
          favoriteSeq: 0,
          title: '',
          categorySeq: 0,
          kind: props.kind,
          note: '',
          currency: Currency.KRW,
          amount: 0,
          payAccount: 0,
          receiveAccount: 0,
          attribute: 0,
        });
        setCategoryPath('');
      } else {
        const favorite = FavoriteMapper.getFavorite(favoriteSeq);
        if (favorite) {
          reset({
            ...favorite,
          });
        }
      }
    },
    hideFavoriteModal: () => setShowModal(false),
  }));

  const clickCategory = () => {
    categoryModalRef.current?.openTransactionCategoryModal(props.kind);
  };

  const onSubmit = async (data: ReqFavoriteModel) => {
    if (data.favoriteSeq === 0) {
      await IpcCaller.saveFavorite(data);
    } else {
      await IpcCaller.updateFavorite(data);
    }
    props.onSubmit();
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  const handleOnSelect = async (categorySeq: number) => {
    setValue('categorySeq', categorySeq);
    setCategoryPath(CategoryMapper.getPathText(categorySeq));
    await trigger('categorySeq');
  };

  useEffect(() => {
    if (categorySeq !== 0) {
      setCategoryPath(CategoryMapper.getPathText(categorySeq));
    }
  }, [categorySeq]);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>
            자주쓰는 {TransactionKindProperties[props.kind].label} 거래
            {favoriteSeq === 0 ? '등록' : '수정'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    거래제목
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control {...register('title')} />
                    {errors.title && <span className="error">{errors.title.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    메모
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" {...register('note')} />
                    {errors.note && <span className="error">{errors.note.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    분류
                  </Form.Label>
                  <Col sm={9}>
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
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    거래통화
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          value={getCurrencyOptions().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptions()}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
                    />
                    {errors.currency && <span className="error">{errors.currency.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    금액
                  </Form.Label>
                  <Col sm={9}>
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
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={3}>
                    지출계좌
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="payAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          isDisabled={props.kind === TransactionKind.INCOME}
                          value={AccountMapper.getOptionBalanceList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getOptionBalanceList()}
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
                  <Form.Label column sm={3}>
                    수입계좌
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="receiveAccount"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          isDisabled={props.kind === TransactionKind.SPENDING}
                          value={AccountMapper.getOptionBalanceList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getOptionBalanceList()}
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
                  <Form.Label column sm={3}>
                    속성
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="attribute"
                      render={({ field }) => {
                        const optionList = CodeMapper.getSubOptionList(CodeMapper.getTransactionKindToCodeMapping(props.kind));
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
      <TransactionCategoryModal ref={categoryModalRef} onSelect={handleOnSelect} />
    </>
  );
});
FavoriteModal.displayName = 'FavoriteModal';

export default FavoriteModal;
