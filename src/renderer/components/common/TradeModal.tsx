import React, { forwardRef } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import { Controller } from 'react-hook-form';
import { OptionNumberType, TradeKindProperties } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import StockMapper from '../../mapper/StockMapper';
import { convertToCommaSymbol, getConfirmKey } from '../util/util';
import LedgerDateField from './part/LedgerDateField';

import useTradeForm from '../../hooks/useTradeForm';
import { TradeModalHandle, LedgerModalProps } from '../../forms/ledgerModalTypes';
import ModalStatus from './part/ModalStatus';

export type { TradeModalHandle } from '../../forms/ledgerModalTypes';
export type TradeModalProps = LedgerModalProps;

const TradeModal = forwardRef<TradeModalHandle, LedgerModalProps>((props, ref) => {
  const { register, control, errors, modal, tradeSeq, accountSeq, price, quantity, kind, currency, changeTradeDate, handleConfirmClick } =
    useTradeForm(props, ref);
  return (
    <Modal size="lg" show={modal.show} onHide={modal.close} animation={false} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {TradeKindProperties[kind]?.label} {tradeSeq === 0 ? '등록' : '수정'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <ModalStatus {...modal} />
        <fieldset disabled={modal.disabled}>
          <Row>
            <Col>
              <Form>
                <Controller
                  control={control}
                  name="tradeDate"
                  render={({ field }) => (
                    <LedgerDateField
                      value={field.value}
                      onChange={field.onChange}
                      onShift={changeTradeDate}
                      error={errors.tradeDate?.message}
                      labelWidth={3}
                    />
                  )}
                />
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    메모
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control type="text" {...register('note')} maxLength={50} />
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
                          isDisabled={modal.disabled}
                          value={AccountMapper.getStockOptionList(currency).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={AccountMapper.getStockOptionList(currency)}
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
                    종목
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="stockSeq"
                      render={({ field }) => (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          isDisabled={modal.disabled}
                          value={StockMapper.getOptionBalanceList(accountSeq).find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={StockMapper.getOptionBalanceList(accountSeq)}
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
                    수량
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="quantity"
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
                    {errors.quantity && <span className="error">{errors.quantity.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    단가
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <NumericFormat
                          thousandSeparator
                          maxLength={11}
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          className="form-control"
                          style={{ textAlign: 'right' }}
                        />
                      )}
                    />
                    {errors.price && <span className="error">{errors.price.message}</span>}
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    합계
                  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      style={{ textAlign: 'right' }}
                      value={convertToCommaSymbol((quantity || 0) * (price || 0), currency)}
                      disabled
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    거래세
                  </Form.Label>
                  <Col sm={9}>
                    <Controller
                      control={control}
                      name="tax"
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
                    {errors.tax && <span className="error">{errors.tax.message}</span>}
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
        </fieldset>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button disabled={modal.disabled} variant="primary" onClick={handleConfirmClick}>
          저장({getConfirmKey()})
        </Button>
        <Button variant="secondary" onClick={modal.close}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
TradeModal.displayName = 'TradeModal';

export default TradeModal;
