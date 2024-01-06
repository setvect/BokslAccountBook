import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OptionNumberType, OptionStringType } from '../../common/RendererModel';
import 'react-datepicker/dist/react-datepicker.css';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from './TransactionCategoryModal';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import { Currency, ExchangeKind, IPC_CHANNEL } from '../../../common/CommonType';
import { ExchangeForm } from '../../../common/ReqModel';
import { getCurrencyOptionList } from '../util/util';
import { ResExchangeModel } from '../../../common/ResModel';
import moment from 'moment';

export interface ExchangeModalHandle {
  openExchangeModal: (type: ExchangeKind, exchangeSeq: number, selectDate: Date | null) => void;
  hideExchangeModal: () => void;
}

export interface ExchangeModalProps {
  onSubmit: () => void;
}

const ExchangeModal = forwardRef<ExchangeModalHandle, ExchangeModalProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const categoryModalRef = useRef<TransactionCategoryModalHandle>(null);

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
  } = useForm<ExchangeForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    openExchangeModal: (t: ExchangeKind, exchangeSeq: number, selectDate: Date | null) => {
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
        window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeGet, (response: any) => {
          const exchangeModel = response as ResExchangeModel;
          reset({
            ...exchangeModel,
            exchangeDate: moment(exchangeModel.exchangeDate).toDate(),
          });
        });
        window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeGet, exchangeSeq);
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

  const onSubmit = (data: ExchangeForm) => {
    const channel = data.exchangeSeq === 0 ? IPC_CHANNEL.CallExchangeSave : IPC_CHANNEL.CallExchangeUpdate;
    window.electron.ipcRenderer.once(channel, () => {
      AccountMapper.loadList(() => {
        props.onSubmit();
        setShowModal(false);
      });
    });
    window.electron.ipcRenderer.sendMessage(channel, data);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };
  const exchangeSeq = watch('exchangeSeq');
  const kind = watch('kind');

  useEffect(() => {
    if (showModal) {
      setFocus('note');
    }
  }, [setFocus, showModal]);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
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
                    {/* 원화 매도이면 원화로 고정 */}
                    <Controller
                      control={control}
                      name="sellCurrency"
                      render={({ field }) => (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          isDisabled={kind === ExchangeKind.EXCHANGE_SELL}
                          value={getCurrencyOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptionList()}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
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
                    {/* 원화 매수이면 원화로 고정 */}
                    <Controller
                      control={control}
                      name="buyCurrency"
                      render={({ field }) => (
                        <Select<OptionStringType, false, GroupBase<OptionStringType>>
                          isDisabled={kind === ExchangeKind.EXCHANGE_BUY}
                          value={getCurrencyOptionList().find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={getCurrencyOptionList()}
                          placeholder="통화 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      )}
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
