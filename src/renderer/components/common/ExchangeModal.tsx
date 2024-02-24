import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, FormControl, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { OptionNumberType, OptionStringType } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import { Currency, ExchangeKind } from '../../../common/CommonType';
import { ReqExchangeModel } from '../../../common/ReqModel';
import { convertToCommaSymbol, getConfirmKey, getCurrencyOptionList } from '../util/util';
import IpcCaller from '../../common/IpcCaller';
import KeyEventChecker from '../../common/KeyEventChecker';
import MyDatePicker from './part/MyDatePicker';

export interface ExchangeModalHandle {
  openExchangeModal: (type: ExchangeKind, exchangeSeq: number, selectDate: Date | null) => void;
  hideExchangeModal: () => void;
}

export interface ExchangeModalProps {
  onSubmit: () => void;
}

const ExchangeModal = forwardRef<ExchangeModalHandle, ExchangeModalProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      exchangeDate: yup.string().required('날짜는 필수입니다.'),
      accountSeq: yup.number().test('is-not-zero', '계좌를 선택해 주세요.', (value) => value !== 0),
      note: yup.string().required('메모는 필수입니다.'),
      sellCurrency: yup.string().required('매도 통화는 필수입니다.'),
      sellAmount: yup.number().test('is-not-zero', '매도 금액은 필수입니다.', (value) => value !== 0),
      buyCurrency: yup
        .string()
        .required('매수 통화는 필수입니다.')
        .test('is-different-from-sellCurrency', '매도 통화와 매수 통화는 달라야 합니다.', (value, context) => {
          const { sellCurrency } = context.parent;
          return value !== sellCurrency;
        }),
      buyAmount: yup.number().test('is-not-zero', '매수 금액은 필수입니다.', (value) => value !== 0),
      fee: yup.number().required('수수료는 필수입니다.'),
    };
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
    watch,
    setFocus,
  } = useForm<ReqExchangeModel>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    openExchangeModal: async (t: ExchangeKind, exchangeSeq: number, selectDate: Date | null) => {
      setShowModal(true);
      reset({
        exchangeSeq: 0,
        kind: t,
        exchangeDate: selectDate === null ? new Date() : selectDate,
        accountSeq: 0,
        note: '',
        sellAmount: 0,
        buyAmount: 0,
        fee: 0,
      });
      if (t === ExchangeKind.EXCHANGE_BUY) {
        setValue('buyCurrency', Currency.KRW);
      } else {
        setValue('sellCurrency', Currency.KRW);
      }

      if (exchangeSeq !== 0) {
        const exchangeModel = await IpcCaller.getExchange(exchangeSeq);
        reset({
          ...exchangeModel,
          exchangeDate: moment(exchangeModel.exchangeDate).toDate(),
        });
      }
    },
    hideExchangeModal: () => setShowModal(false),
  }));

  const changeExchangeDate = (diff: number) => {
    const currentDate = getValues('exchangeDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('exchangeDate', newDate);
  };

  const onSubmit = async (data: ReqExchangeModel) => {
    if (data.exchangeSeq === 0) {
      await IpcCaller.saveExchange(data);
    } else {
      await IpcCaller.updateExchange(data);
    }

    await AccountMapper.loadList();
    props.onSubmit();
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };
  const exchangeSeq = watch('exchangeSeq');
  const kind = watch('kind');
  const accountSeq = watch('accountSeq');

  const handleShortKeyPress = (event: KeyboardEvent) => {
    if (KeyEventChecker.isCmdOrCtrl(event) && KeyEventChecker.isEnter(event)) {
      handleConfirmClick();
    }
  };

  useEffect(
    () => {
      const handleKeyPressEvent = (event: KeyboardEvent) => handleShortKeyPress(event);

      if (showModal) {
        setFocus('note');
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
    <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          환전({kind === ExchangeKind.EXCHANGE_BUY ? '원화 매수' : '원화 매도'}) {exchangeSeq === 0 ? '등록' : '수정'}
        </Modal.Title>
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
                            <MyDatePicker dateFormat="yyyy-MM-dd" onChange={field.onChange} selected={field.value} className="form-control" />
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
                  메모
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('note')} maxLength={30} />
                  {errors.note && <span className="error">{errors.note.message}</span>}
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
                        value={AccountMapper.getOptionBalanceList().find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={AccountMapper.getOptionBalanceList()}
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
                  매도 통화
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="sellCurrency"
                    render={({ field }) => {
                      // 원화 매도이면 원화로 고정
                      if (kind === ExchangeKind.EXCHANGE_SELL) {
                        const balanceAmount = AccountMapper.getBalanceAmount(accountSeq, Currency.KRW);
                        return (
                          <div>
                            <span>
                              <FormControl
                                disabled
                                type="text"
                                readOnly
                                value={`원화 (잔고: ${convertToCommaSymbol(balanceAmount, Currency.KRW)})`}
                              />
                            </span>
                            <input type="hidden" readOnly value={Currency.KRW} />
                          </div>
                        );
                      }
                      return (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          value={getCurrencyOptionList(Currency.KRW, accountSeq).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptionList(Currency.KRW, accountSeq)}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      );
                    }}
                  />
                  {errors.sellCurrency && <span className="error">{errors.sellCurrency.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  매도 금액
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="sellAmount"
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
                  {errors.sellAmount && <span className="error">{errors.sellAmount.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  매수 통화
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="buyCurrency"
                    render={({ field }) => {
                      // 원화 매수이면 원화로 고정
                      if (kind === ExchangeKind.EXCHANGE_BUY) {
                        const balanceAmount = AccountMapper.getBalanceAmount(accountSeq, Currency.KRW);
                        return (
                          <div>
                            <span>
                              <FormControl
                                disabled
                                type="text"
                                readOnly
                                value={`원화 (잔고: ${convertToCommaSymbol(balanceAmount, Currency.KRW)})`}
                              />
                            </span>
                            <input type="hidden" readOnly value={Currency.KRW} />
                          </div>
                        );
                      }
                      return (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          value={getCurrencyOptionList(Currency.KRW, accountSeq).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptionList(Currency.KRW, accountSeq)}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      );
                    }}
                  />
                  {errors.buyCurrency && <span className="error">{errors.buyCurrency.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  매수 금액
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="buyAmount"
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
                  {errors.buyAmount && <span className="error">{errors.buyAmount.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  수수료(원)
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
          저장({getConfirmKey()})
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
ExchangeModal.displayName = 'ExchangeModal';

export default ExchangeModal;
