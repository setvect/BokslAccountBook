import React, { forwardRef } from 'react';
import { Button, Col, Form, FormControl, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import { Controller } from 'react-hook-form';
import { OptionNumberType, OptionStringType } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import { Currency, ExchangeKind } from '../../../common/CommonType';
import { convertToCommaSymbol, getConfirmKey } from '../util/util';
import LedgerDateField from './part/LedgerDateField';
import { getCurrencyOptionList } from '../util/currencyIOptionUtils';

import useExchangeForm from '../../hooks/useExchangeForm';
import { ExchangeModalHandle, LedgerModalProps } from '../../forms/ledgerModalTypes';
import ModalStatus from './part/ModalStatus';

export type { ExchangeModalHandle } from '../../forms/ledgerModalTypes';
export type ExchangeModalProps = LedgerModalProps;

const ExchangeModal = forwardRef<ExchangeModalHandle, LedgerModalProps>((props, ref) => {
  const { register, control, errors, modal, exchangeSeq, kind, accountSeq, changeExchangeDate, handleConfirmClick } = useExchangeForm(props, ref);
  return (
    <Modal size="lg" show={modal.show} onHide={modal.close} animation={false} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          환전({kind === ExchangeKind.EXCHANGE_BUY ? '원화 매수' : '원화 매도'}) {exchangeSeq === 0 ? '등록' : '수정'}
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
                  name="exchangeDate"
                  render={({ field }) => (
                    <LedgerDateField
                      value={field.value}
                      onChange={field.onChange}
                      onShift={changeExchangeDate}
                      error={errors.exchangeDate?.message}
                      labelWidth={3}
                    />
                  )}
                />
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
                          isDisabled={modal.disabled}
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
                            isDisabled={modal.disabled}
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
                            isDisabled={modal.disabled}
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
ExchangeModal.displayName = 'ExchangeModal';

export default ExchangeModal;
