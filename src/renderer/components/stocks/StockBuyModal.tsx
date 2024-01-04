import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NumericFormat } from 'react-number-format';
import { OptionNumberType } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import { StockBuyForm } from '../../../common/ReqModel';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import { IPC_CHANNEL } from '../../../common/CommonType';

export interface StockBuyModalHandle {
  openStockBuyModal: (stockBuySeq: number) => void;
  hideStockBuyModal: () => void;
}

export interface StockBuyModalPropsMethods {
  onSubmit: () => void;
}

const StockBuyModal = forwardRef<StockBuyModalHandle, StockBuyModalPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const stockSeqRef = React.useRef<any>(null);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      stockSeq: yup.number().test('is-not-zero', '종목유형을 선택해 주세요.', (value) => value !== 0),
      accountSeq: yup.number().test('is-not-zero', '계좌를 선택해 주세요.', (value) => value !== 0),
      buyAmount: yup.number().required('매수금액은 필수입니다.'),
      quantity: yup.number().required('수량은 필수입니다.'),
    };
    return yup.object().shape(schemaFields);
  };

  const validationSchema = createValidationSchema();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<StockBuyForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  const stockBuySeq = watch('stockBuySeq');

  useImperativeHandle(ref, () => ({
    openStockBuyModal: (stockBuySeq: number) => {
      if (stockBuySeq === 0) {
        reset({
          stockBuySeq: 0,
          stockSeq: 0,
          accountSeq: 0,
          buyAmount: 0,
          quantity: 0,
        });
        setShowModal(true);
      } else {
        const stockBuy = StockBuyMapper.getStockBuy(stockBuySeq);
        reset({
          stockBuySeq: stockBuy.stockBuySeq,
          stockSeq: stockBuy.stockSeq,
          accountSeq: stockBuy.accountSeq,
          buyAmount: stockBuy.buyAmount,
          quantity: stockBuy.quantity,
        });
        setShowModal(true);
      }
    },
    hideStockBuyModal: () => setShowModal(false),
  }));

  const onSubmit = (data: StockBuyForm) => {
    const channel = data.stockBuySeq === 0 ? IPC_CHANNEL.CallStockBuySave : IPC_CHANNEL.CallStockBuyUpdate;
    window.electron.ipcRenderer.once(channel, () => {
      StockBuyMapper.loadStockBuyList(() => {
        props.onSubmit();
        setShowModal(false);
      });
    });
    window.electron.ipcRenderer.sendMessage(channel, data);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (showModal) {
      stockSeqRef.current?.focus();
    }
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>주식 매수 종목 {stockBuySeq === 0 ? '등록' : '수정'}</Modal.Title>
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
                        value={StockMapper.getStockOptionList().find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={StockMapper.getStockOptionList()}
                        ref={stockSeqRef}
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
                        value={AccountMapper.getAccountOptionList().find((option) => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        options={AccountMapper.getAccountOptionList()}
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
