import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, FormGroup, FormLabel, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import { NumericFormat } from 'react-number-format';
import { CurrencyProperties, StockEvaluateModel } from '../../common/RendererModel';
import SnapshotStockListInput from './SnapshotStockListInput';
import { Currency, ExchangeRateModel } from '../../../common/CommonType';
import { SnapshotForm } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';
import StockBuyMapper from '../../mapper/StockBuyMapper';

export interface SnapshotModelHandle {
  openSnapshotModal: (snapshotSeq: number) => void;
  hideSnapshotModal: () => void;
}

export interface SnapshotModelProps {
  onSubmit: () => void;
}

const SnapshotModal = forwardRef<SnapshotModelHandle, SnapshotModelProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      note: yup.string().required('설명은 필수입니다.'),
      exchangeRateList: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup.string().required('통화를 선택하세요.'),
            rate: yup.number().typeError('환율은 숫자여야 합니다.').required('환율을 입력하세요.'),
          }),
        )
        .required('잔고는 필수입니다.'),
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
    setValue,
    getValues,
    setFocus,
    watch,
  } = useForm<SnapshotForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: {
      snapshotSeq: 0,
      note: '',
      exchangeRateList: [],
      stockEvaluateList: [],
      stockSellCheckDate: new Date(),
    },
  });

  const snapshotSeq = watch('snapshotSeq');
  const snapshotForm = watch();

  useImperativeHandle(ref, () => ({
    openSnapshotModal: async (snapshotSeq: number) => {
      setShowModal(true);
      let exchangeRate: ExchangeRateModel[] = [];
      if (snapshotSeq === 0) {
        const allCurrency = await IpcCaller.getExchangeRate();
        exchangeRate = allCurrency.filter((rate) => rate.currency !== Currency.KRW);
      }

      const stockBuyList = StockBuyMapper.getList();
      if (snapshotSeq === 0) {
        reset({
          snapshotSeq: 0,
          note: '',
          exchangeRateList: exchangeRate,
          stockEvaluateList: stockBuyList
            .filter((stockBuy) => stockBuy.quantity > 0)
            .map((stockBuy) => {
              return {
                stockBuySeq: stockBuy.stockBuySeq,
                buyAmount: stockBuy.buyAmount,
                evaluateAmount: stockBuy.buyAmount,
              };
            }),
          stockSellCheckDate: new Date(),
        });
      } else {
        const resSnapshotModel = await IpcCaller.getSnapshot(snapshotSeq);
        let stockSellCheckDate = new Date();
        if (resSnapshotModel.stockSellCheckDate) {
          stockSellCheckDate = new Date(resSnapshotModel.stockSellCheckDate);
        }

        const snapshotForm: SnapshotForm = {
          snapshotSeq: resSnapshotModel.snapshotSeq,
          note: resSnapshotModel.note,
          exchangeRateList: resSnapshotModel.exchangeRateList,
          stockEvaluateList: resSnapshotModel.stockEvaluateList.map((stockEvaluate) => {
            return {
              stockBuySeq: stockEvaluate.stockBuySeq,
              buyAmount: stockEvaluate.buyAmount,
              evaluateAmount: stockEvaluate.evaluateAmount,
            };
          }),
          stockSellCheckDate,
        };
        reset(snapshotForm);
      }
    },
    hideSnapshotModal: () => setShowModal(false),
  }));

  const onSubmit = async (data: SnapshotForm) => {
    if (data.snapshotSeq === 0) {
      await IpcCaller.saveSnapshot(data);
    } else {
      await IpcCaller.updateSnapshot(data);
    }
    props.onSubmit();
    setShowModal(false);
  };

  const onError = (errors: FieldErrors) => {
    console.error('Form validation errors:', errors);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit, onError)();
  };

  const updateStockEvaluateListValue = (index: number, stockEvaluateModel: StockEvaluateModel) => {
    setValue(`stockEvaluateList.${index}.evaluateAmount`, stockEvaluateModel.evaluateAmount);
  };

  useEffect(() => {
    if (showModal) {
      setFocus('note');
    }
  }, [setFocus, showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 종목 {snapshotSeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Row>
                <Col md={6}>
                  <FormGroup as={Row} className="mb-3">
                    <FormLabel column sm={3}>
                      설명
                    </FormLabel>
                    <Col sm={9}>
                      <Form.Control type="text" {...register('note')} maxLength={30} />
                      {errors.note && <span className="error">{errors.note.message}</span>}
                    </Col>
                  </FormGroup>
                  <FormGroup as={Row} className="mb-3">
                    <FormLabel column sm={3}>
                      매도 체크일
                    </FormLabel>
                    <Col sm={9}>
                      <div className="form-group">
                        <Controller
                          control={control}
                          name="stockSellCheckDate"
                          render={({ field }) => (
                            <DatePicker dateFormat="yyyy-MM-dd" onChange={field.onChange} selected={field.value} className="form-control" />
                          )}
                        />
                        {errors.stockSellCheckDate && (
                          <span className="error" style={{ display: 'block' }}>
                            {errors.stockSellCheckDate.message}
                          </span>
                        )}
                      </div>
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  {snapshotForm.exchangeRateList.map(({ currency, rate }, index) => (
                    <FormGroup as={Row} className="mb-3" key={currency}>
                      <FormLabel column sm={3}>
                        {`${CurrencyProperties[currency].name}(${CurrencyProperties[currency].symbol})`} 환율
                      </FormLabel>
                      <Col sm={9}>
                        <Controller
                          control={control}
                          name={`exchangeRateList.${index}.rate`}
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
                        {errors.exchangeRateList?.[index]?.rate && (
                          <span className="error">
                            {
                              // @ts-ignore
                              errors.exchangeRateList[index].amount.message
                            }
                          </span>
                        )}
                      </Col>
                    </FormGroup>
                  ))}
                </Col>
              </Row>
              <Row>
                <Col>
                  <SnapshotStockListInput
                    stockEvaluateList={getValues('stockEvaluateList')}
                    onUpdateValue={(index, value) => {
                      updateStockEvaluateListValue(index, value);
                    }}
                  />
                </Col>
              </Row>
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
SnapshotModal.displayName = 'SnapshotModal';
export default SnapshotModal;
