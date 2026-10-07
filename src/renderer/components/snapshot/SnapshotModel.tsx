import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Button, Col, Form, FormGroup, FormLabel, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NumericFormat } from 'react-number-format';
import { useReferenceData } from '../../state/referenceData';
import { CurrencyProperties } from '../../common/RendererModel';
import SnapshotStockListInput from './SnapshotStockListInput';
import { Currency } from '../../../common/CommonType';
import useModalSession from '../../hooks/useModalSession';
import ModalStatus from '../common/part/ModalStatus';
import { ReqSnapshotModelSchema } from '../../../common/ipc/requestSchemas';
import { ReqSnapshotModel } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import MyDatePicker from '../common/part/MyDatePicker';
import { ResStockEvaluateModel } from '../../../common/ResModel';

export interface SnapshotModelHandle {
  openSnapshotModal: (snapshotSeq: number) => void;
  hideSnapshotModal: () => void;
}

export interface SnapshotModelProps {
  onSubmit: () => void;
}

const SnapshotModal = forwardRef<SnapshotModelHandle, SnapshotModelProps>((props, ref) => {
  useReferenceData();
  const modal = useModalSession();
  const validationSchema = ReqSnapshotModelSchema.shape({ note: yup.string().required('설명은 필수입니다.') });

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
  } = useForm<ReqSnapshotModel>({
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
    openSnapshotModal: (snapshotSeq: number) => {
      modal.open(
        () => reset({ snapshotSeq: 0, note: '', exchangeRateList: [], stockEvaluateList: [] }),
        async (): Promise<ReqSnapshotModel> => {
          if (snapshotSeq) {
            const snapshot = await IpcCaller.getSnapshot(snapshotSeq);
            return {
              snapshotSeq,
              note: snapshot.note,
              exchangeRateList: snapshot.exchangeRateList,
              stockEvaluateList: snapshot.stockEvaluateList,
              stockSellCheckDate: snapshot.stockSellCheckDate ? new Date(snapshot.stockSellCheckDate) : undefined,
            };
          }
          const rates = await IpcCaller.getExchangeRate();
          return {
            snapshotSeq: 0,
            note: '',
            exchangeRateList: rates.filter((rate) => rate.currency !== Currency.KRW),
            stockSellCheckDate: new Date(),
            stockEvaluateList: StockBuyMapper.getList()
              .filter((holding) => holding.quantity > 0)
              .map((holding) => ({ stockBuySeq: holding.stockBuySeq, buyAmount: holding.buyAmount, evaluateAmount: holding.buyAmount })),
          };
        },
        reset,
      );
    },
    hideSnapshotModal: modal.close,
  }));

  const handleConfirmClick = () => {
    modal.submit(async (isCurrent) => {
      await handleSubmit(async (data) => {
        if (!isCurrent()) return;
        if (data.snapshotSeq === 0) await IpcCaller.saveSnapshot(data);
        else await IpcCaller.updateSnapshot(data);
        if (isCurrent()) modal.close();
        props.onSubmit();
      })();
    });
  };

  const updateStockEvaluateListValue = (index: number, stockEvaluateModel: ResStockEvaluateModel) => {
    setValue(`stockEvaluateList.${index}.evaluateAmount`, stockEvaluateModel.evaluateAmount);
  };

  useEffect(() => {
    if (modal.show && modal.ready) {
      setFocus('note');
    }
  }, [setFocus, modal.show, modal.ready]);

  return (
    <Modal show={modal.show} onHide={modal.close} animation={false} dialogClassName="custom-modal-xxl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>자산 평가 {snapshotSeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <ModalStatus {...modal} />
        <fieldset disabled={modal.disabled}>
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
                            render={({ field }) => <MyDatePicker onChange={field.onChange} selected={field.value} className="form-control" />}
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
                    {snapshotForm.exchangeRateList.map(({ currency }, index) => (
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
                          {errors.exchangeRateList?.[index]?.rate && <span className="error">{errors.exchangeRateList?.[index]?.rate?.message}</span>}
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
        </fieldset>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button disabled={modal.disabled} variant="primary" onClick={handleConfirmClick}>
          저장
        </Button>
        <Button variant="secondary" onClick={modal.close}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
SnapshotModal.displayName = 'SnapshotModal';
export default SnapshotModal;
