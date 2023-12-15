import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Currency, CurrencyProperties, ExchangeKind, ExchangeForm, OptionNumberType } from '../../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import darkThemeStyles from '../../common/BokslConstant';

export interface ExchangeModalHandle {
  openExchangeModal: (type: ExchangeKind, exchangeSeq: number, saveCallback: () => void) => void;
  hideExchangeModal: () => void;
}

const ExchangeModal = forwardRef<ExchangeModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<ExchangeKind>(ExchangeKind.BUY);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<ExchangeForm>({
    exchangeSeq: 0,
    exchangeDate: new Date(),
    accountSeq: 0,
    note: '안녕',
    currencyToSellCode: Currency.KRW,
    currencyToSellPrice: 10000,
    currencyToBuyCode: Currency.USD,
    currencyToBuyPrice: 8.55,
    fee: 5,
  });

  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      exchangeDate: yup.string().required('날짜는 필수입니다.'),
      accountSeq: yup.number().test('is-not-zero', '계좌를 선택해 주세요.', (value) => value !== 0),
      note: yup.string().required('메모는 필수입니다.'),
      currencyToSellCode: yup.string().required('매도 통화는 필수입니다.'),
      currencyToSellPrice: yup.number().required('매도 금액은 필수입니다.'),
      currencyToBuyCode: yup
        .string()
        .required('매수 통화는 필수입니다.')
        .test('is-different-from-currencyToSellCode', '매도 통화와 매수 통화는 달라야 합니다.', (value, context) => {
          const { currencyToSellCode } = context.parent;
          return value !== currencyToSellCode;
        }),
      currencyToBuyPrice: yup.number().required('매수 금액은 필수입니다.'),
      fee: yup.number().required('수수료는 필수입니다.'),
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
    getValues,
    setValue,
  } = useForm<ExchangeForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openExchangeModal: (t: ExchangeKind, item: ExchangeForm, callback: () => void) => {
      setShowModal(true);
      setForm(item);
      setType(t);
      setParentCallback(() => callback);
      reset();
    },
    hideExchangeModal: () => setShowModal(false),
  }));

  const options = [
    { value: 1, label: '계좌 1' },
    { value: 2, label: '계좌 2' },
    { value: 3, label: '계좌 3' },
  ];

  function changeExchangeDate(diff: number) {
    const currentDate = getValues('exchangeDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('exchangeDate', newDate);
  }

  const onSubmit = (data: ExchangeForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const input = document.getElementById('exchangeNote');
    input?.focus();
  }, []);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>환전 - {type}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    날짜
                  </Form.Label>
                  <Col sm={9}>
                    <Row>
                      <Col sm={7}>
                        <div className="form-group">
                          <Controller
                            control={control}
                            name="exchangeDate"
                            render={({ field }) => (
                              <DatePicker dateFormat="yyyy-MM-dd" onChange={field.onChange} selected={field.value} className="form-control" />
                            )}
                          />
                          {errors.exchangeDate && (
                            <span className="error" style={{ display: 'block' }}>
                              {errors.exchangeDate.message}
                            </span>
                          )}
                        </div>
                      </Col>
                      <Col>
                        <Button variant="outline-success" onClick={() => changeExchangeDate(-1)}>
                          전날
                        </Button>
                        <Button variant="outline-success" style={{ marginLeft: '5px' }} onClick={() => changeExchangeDate(1)}>
                          다음날
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    거래계좌
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="accountSeq"
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
                    {errors.accountSeq && <span className="error">{errors.accountSeq.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    메모
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" id="exchangeNote" {...register('note')} maxLength={30} />
                    {errors.note && <span className="error">{errors.note.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    매도 통화
                  </Form.Label>
                  <Col sm={9}>
                    {/* 원화 매도이면 원화로 고정 */}
                    <Form.Select {...register('currencyToSellCode')} disabled={type === ExchangeKind.SELL}>
                      {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
                        <option key={currency} value={currency}>
                          {`${name} (${symbol})`} 잔고: {symbol}100,000
                        </option>
                      ))}
                    </Form.Select>
                    {errors.currencyToSellCode && <span className="error">{errors.currencyToSellCode.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    매도 금액
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="currencyToSellPrice"
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
                    {errors.currencyToSellPrice && <span className="error">{errors.currencyToSellPrice.message}</span>}
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    매수 통화
                  </Form.Label>
                  <Col sm={9}>
                    {/* 원화 매수이면 원화로 고정 */}
                    <Form.Select {...register('currencyToBuyCode')} disabled={type === ExchangeKind.BUY}>
                      {Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => (
                        <option key={currency} value={currency}>
                          {`${name} (${symbol})`} 잔고: {symbol}100,000
                        </option>
                      ))}
                    </Form.Select>
                    {errors.currencyToBuyCode && <span className="error">{errors.currencyToBuyCode.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    매수 금액
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="currencyToBuyPrice"
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
                    {errors.currencyToBuyPrice && <span className="error">{errors.currencyToBuyPrice.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    수수료
                  </Form.Label>
                  <Col sm={9}>
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
ExchangeModal.displayName = 'ExchangeModal';

export default ExchangeModal;
