import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, FormGroup, FormLabel, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { NumericFormat } from 'react-number-format';
import { AssetSnapshotForm, Currency, CurrencyProperties } from '../common/BokslTypes';

export interface AssetSnapshotModelHandle {
  openAssetSnapshotModal: (assetSnapshotSeq: number, saveCallback: () => void) => void;
  hideAssetSnapshotModal: () => void;
}

const AssetSnapshotModal = forwardRef<AssetSnapshotModelHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<AssetSnapshotForm>({
    assetSnapshotSeq: 1,
    note: '2022년 6월 1일',
    exchangeRate: [
      { currency: Currency.USD, amount: 1301.28 },
      { currency: Currency.JPY, amount: 9.0196 },
    ],
    stockEvaluate: [
      { stockBuySeq: 1, currency: Currency.KRW, buyAmount: 1000, evaluateAmount: 1100 },
      { stockBuySeq: 2, currency: Currency.KRW, buyAmount: 80.05, evaluateAmount: 90.5 },
    ],
    stockSellCheckDate: new Date(2023, 5, 1),
    regDate: new Date(2023, 5, 1),
  });

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      note: yup.string().required('설명은 필수입니다.'),
      exchangeRate: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup.string().required('통화를 선택하세요.'),
            amount: yup.number().typeError('금액은 숫자여야 합니다.').required('금액을 입력하세요.'),
          }),
        )
        .required('잔고는 필수입니다.'),
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
  } = useForm<AssetSnapshotForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openAssetSnapshotModal: (assetSnapshotSeq: number, callback: () => void) => {
      setShowModal(true);
      // TODO 값 불러오기
      // setForm(item);
      setForm({ ...form, assetSnapshotSeq });
      setParentCallback(() => callback);
      reset();
    },
    hideAssetSnapshotModal: () => setShowModal(false),
  }));

  const onSubmit = (data: AssetSnapshotForm) => {
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
    const input = document.getElementById('AssetSnapshotName');
    input?.focus();
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 종목 {form.assetSnapshotSeq === 0 ? '등록' : '수정'}</Modal.Title>
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
                      <Form.Control type="text" id="AssetSnapshotName" {...register('note')} maxLength={30} />
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
                  {Object.entries(CurrencyProperties)
                    .filter(([currency]) => currency !== Currency.KRW)
                    .map(([currency, { name, symbol }], index) => (
                      <FormGroup as={Row} className="mb-3" key={currency}>
                        <FormLabel column sm={3}>
                          {`${name}(${symbol})`} 환율
                        </FormLabel>
                        <Col sm={9}>
                          <Controller
                            control={control}
                            name={`exchangeRate.${index}.amount`}
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
                          {errors.exchangeRate?.[index]?.amount && (
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
AssetSnapshotModal.displayName = 'AccountModal';

export default AssetSnapshotModal;
