import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NumericFormat } from 'react-number-format';
import { OptionNumberType, StockBuyForm } from '../../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import darkThemeStyles from '../../common/BokslConstant';
import { getStockList } from '../../mapper/StockMapper';
import { getAccountList } from '../../mapper/AccountMapper';

export interface StockBuyModalHandle {
  openStockBuyModal: (stockBuySeq: number, saveCallback: () => void) => void;
  hideStockBuyModal: () => void;
}

const StockBuyModal = forwardRef<StockBuyModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<StockBuyForm>({
    stockBuySeq: 0,
    stockSeq: 0,
    accountSeq: 0,
    purchaseAmount: 0,
    quantity: 0,
  });

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      stockSeq: yup.number().test('is-not-zero', '종목유형을 선택해 주세요.', (value) => value !== 0),
      accountSeq: yup.number().test('is-not-zero', '계좌를 선택해 주세요.', (value) => value !== 0),
      purchaseAmount: yup.number().required('매수금액은 필수입니다.'),
      quantity: yup.number().required('수량은 필수입니다.'),
    };
    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StockBuyForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  const stockList = getStockList().map((stock) => ({
    value: stock.stockSeq,
    label: `${stock.name} (${stock.currency})`,
  }));

  const accountList = getAccountList().map((account) => ({
    value: account.accountSeq,
    label: account.name,
  }));

  useImperativeHandle(ref, () => ({
    openStockBuyModal: (stockBuySeq: number, callback: () => void) => {
      const updatedForm = { ...form, stockBuySeq };
      // TODO 값 불러오기
      setForm(updatedForm);
      reset(updatedForm);
      setParentCallback(() => callback);
      setShowModal(true);
    },
    hideStockBuyModal: () => setShowModal(false),
  }));

  const onSubmit = (data: StockBuyForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }
    const input = document.getElementById('accountName');
    input?.focus();
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 매수 종목 {form.stockBuySeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  종목
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="stockSeq"
                    render={({ field }) => (
                      <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                        value={stockList.find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={stockList}
                        placeholder="종목 선택"
                        className="react-select-container"
                        styles={darkThemeStyles}
                      />
                    )}
                  />
                  {errors.stockSeq && <span className="error">{errors.stockSeq.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  연결계좌
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="accountSeq"
                    render={({ field }) => (
                      <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                        value={accountList.find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={accountList}
                        placeholder="계좌 선택"
                        className="react-select-container"
                        styles={darkThemeStyles}
                      />
                    )}
                  />
                  {errors.accountSeq && <span className="error">{errors.accountSeq.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  매수금액
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="purchaseAmount"
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
                  {errors.purchaseAmount && <span className="error">{errors.purchaseAmount.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  수량
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                      <NumericFormat
                        thousandSeparator
                        maxLength={10}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue);
                        }}
                        className="form-control"
                        style={{ textAlign: 'right' }}
                      />
                    )}
                  />
                  {errors.quantity && <span className="error">{errors.quantity.message}</span>}
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
  );
});
StockBuyModal.displayName = 'AccountModal';

export default StockBuyModal;
