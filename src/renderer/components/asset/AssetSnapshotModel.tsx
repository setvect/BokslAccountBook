import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, FormGroup, FormLabel, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import { NumericFormat } from 'react-number-format';
import { CurrencyProperties, StockEvaluateModel } from '../../common/RendererModel';
import AssetSnapshotStockListInput from './AssetSnapshotStockListInput';
import { Currency, ExchangeRateModel } from '../../../common/CommonType';
import { AssetSnapshotForm } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';
import StockBuyMapper from '../../mapper/StockBuyMapper';

export interface AssetSnapshotModelHandle {
  openAssetSnapshotModal: (assetSnapshotSeq: number, saveCallback: () => void) => void;
  hideAssetSnapshotModal: () => void;
}

const AssetSnapshotModal = forwardRef<AssetSnapshotModelHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      note: yup.string().required('설명은 필수입니다.'),
      exchangeRate: yup
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
  } = useForm<AssetSnapshotForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: {
      assetSnapshotSeq: 0,
      note: '',
      exchangeRate: [],
      stockEvaluate: [],
      stockSellCheckDate: new Date(),
    },
  });

  const assetSnapshotSeq = watch('assetSnapshotSeq');
  const assetSnapshotForm = watch();

  useImperativeHandle(ref, () => ({
    openAssetSnapshotModal: async (assetSnapshotSeq: number, callback: () => void) => {
      setShowModal(true);
      let exchangeRate: ExchangeRateModel[] = [];
      if (assetSnapshotSeq === 0) {
        const allCurrency = await IpcCaller.getCurrencyRate();
        exchangeRate = allCurrency.filter((rate) => rate.currency !== Currency.KRW);
      }

      const stockBuyList = StockBuyMapper.getList();
      reset({
        assetSnapshotSeq,
        note: '',
        exchangeRate,
        stockEvaluate: stockBuyList.map((stockBuy) => {
          return {
            stockBuySeq: stockBuy.stockBuySeq,
            buyAmount: stockBuy.buyAmount,
            evaluateAmount: stockBuy.buyAmount,
          };
        }),
        stockSellCheckDate: new Date(),
      });
      setParentCallback(() => callback);
    },
    hideAssetSnapshotModal: () => setShowModal(false),
  }));

  const onSubmit = (data: AssetSnapshotForm) => {
    console.log('data', data);
    parentCallback();
  };

  const onError = (errors: FieldErrors) => {
    console.log('Form validation errors:', errors);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit, onError)();
  };

  const updateStockEvaluateListValue = (index: number, stockEvaluateModel: StockEvaluateModel) => {
    setValue(`stockEvaluate.${index}.evaluateAmount`, stockEvaluateModel.evaluateAmount);
  };

  useEffect(() => {
    if (showModal) {
      setFocus('note');
    }
  }, [setFocus, showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 종목 {assetSnapshotSeq === 0 ? '등록' : '수정'}</Modal.Title>
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
                  {assetSnapshotForm.exchangeRate.map(({ currency, rate }, index) => (
                    <FormGroup as={Row} className="mb-3" key={currency}>
                      <FormLabel column sm={3}>
                        {`${CurrencyProperties[currency].name}(${CurrencyProperties[currency].symbol})`} 환율
                      </FormLabel>
                      <Col sm={9}>
                        <Controller
                          control={control}
                          name={`exchangeRate.${index}.rate`}
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
                        {errors.exchangeRate?.[index]?.rate && (
                          <span className="error">
                            {
                              // @ts-ignore
                              errors.exchangeRate[index].amount.message
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
                  <AssetSnapshotStockListInput
                    stockEvaluateList={getValues('stockEvaluate')}
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
AssetSnapshotModal.displayName = 'AssetSnapshotModal';
export default AssetSnapshotModal;
