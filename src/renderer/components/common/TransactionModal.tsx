import React, { forwardRef } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import { NumericFormat } from 'react-number-format';
import { Controller } from 'react-hook-form';
import { OptionNumberType, OptionStringType, TransactionKindProperties } from '../../common/RendererModel';
import { TransactionKind } from '../../../common/CommonType';
import FavoriteList from './FavoriteList';
import TransactionCategoryModal from './TransactionCategoryModal';
import darkThemeStyles from '../../common/RendererConstant';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import AutoComplete from './AutoComplete';
import { getConfirmKey, getReConfirmKey } from '../util/util';
import LedgerDateField from './part/LedgerDateField';
import { getCurrencyOptionList } from '../util/currencyIOptionUtils';

import useTransactionForm from '../../hooks/useTransactionForm';
import { TransactionModalHandle, LedgerModalProps } from '../../forms/ledgerModalTypes';
import ModalStatus from './part/ModalStatus';

export type { TransactionModalHandle } from '../../forms/ledgerModalTypes';
export type TransactionModalProps = LedgerModalProps;

const TransactionModal = forwardRef<TransactionModalHandle, LedgerModalProps>((props, ref) => {
  const {
    register,
    control,
    errors,
    modal,
    categoryPath,
    kind,
    transactionSeq,
    currency,
    categoryModalRef,
    autoCompleteRef,
    changeTransactionDate,
    handleCategoryClick,
    handleCategorySelect,
    handleOnSelect,
    handleSelectFavorite,
    handleConfirmClick,
    handleConfirmReInputClick,
  } = useTransactionForm(props, ref);
  return (
    <>
      <Modal show={modal.show} onHide={modal.close} animation={false} dialogClassName="modal-xl" centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>
            {TransactionKindProperties[kind].label} 내역 {transactionSeq === 0 ? '등록' : '수정'}
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
                    name="transactionDate"
                    render={({ field }) => (
                      <LedgerDateField
                        value={field.value}
                        onChange={field.onChange}
                        onShift={changeTransactionDate}
                        error={errors.transactionDate?.message}
                        labelWidth={2}
                      />
                    )}
                  />
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      메모
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="note"
                        render={({ field }) => (
                          <AutoComplete
                            value={field.value}
                            kind={kind}
                            onChange={(newValue) => field.onChange(newValue)}
                            onCategorySelect={(categorySeq) => handleCategorySelect(categorySeq)}
                            ref={autoCompleteRef}
                          />
                        )}
                      />
                      {errors.note && <span className="error">{errors.note.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      분류
                    </Form.Label>
                    <Col sm={10}>
                      <InputGroup>
                        <input type="hidden" {...register('categorySeq')} />
                        <Form.Control readOnly type="text" value={categoryPath} />
                        <Button variant="outline-secondary" onClick={() => handleCategoryClick()}>
                          선택
                        </Button>
                      </InputGroup>
                      {errors.categorySeq && <span className="error">{errors.categorySeq.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      거래 통화
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                          <Select<OptionStringType, false, GroupBase<OptionStringType>>
                            isDisabled={modal.disabled}
                            value={getCurrencyOptionList().find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option?.value)}
                            options={getCurrencyOptionList()}
                            placeholder="통화 선택"
                            className="react-select-container"
                            styles={darkThemeStyles}
                          />
                        )}
                      />
                      {errors.currency && <span className="error">{errors.currency.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      금액
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="amount"
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
                      {errors.amount && <span className="error">{errors.amount.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      지출계좌
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="payAccount"
                        render={({ field }) => (
                          <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                            isDisabled={modal.disabled || kind === TransactionKind.INCOME}
                            value={AccountMapper.getOptionBalanceList(currency).find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option?.value)}
                            options={AccountMapper.getOptionBalanceList(currency)}
                            placeholder="계좌 선택"
                            className="react-select-container"
                            styles={darkThemeStyles}
                          />
                        )}
                      />
                      {errors.payAccount && <span className="error">{errors.payAccount.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      수입계좌
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="receiveAccount"
                        render={({ field }) => (
                          <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                            isDisabled={modal.disabled || kind === TransactionKind.SPENDING}
                            value={AccountMapper.getOptionBalanceList(currency).find((option) => option.value === field.value)}
                            onChange={(option) => field.onChange(option?.value)}
                            options={AccountMapper.getOptionBalanceList(currency)}
                            placeholder="계좌 선택"
                            className="react-select-container"
                            styles={darkThemeStyles}
                          />
                        )}
                      />
                      {errors.receiveAccount && <span className="error">{errors.receiveAccount.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      속성
                    </Form.Label>
                    <Col sm={10}>
                      <Controller
                        control={control}
                        name="attribute"
                        render={({ field }) => {
                          const optionList = CodeMapper.getSubOptionList(CodeMapper.getTransactionKindToCodeMapping(kind));
                          return (
                            <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                              isDisabled={modal.disabled}
                              value={optionList.find((option) => option.value === field.value)}
                              onChange={(option) => field.onChange(option?.value)}
                              options={optionList}
                              placeholder="속성 성택"
                              className="react-select-container"
                              styles={darkThemeStyles}
                            />
                          );
                        }}
                      />
                      {errors.attribute && <span className="error">{errors.attribute.message}</span>}
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm={2}>
                      수수료
                    </Form.Label>
                    <Col sm={10}>
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
              <Col>
                <FavoriteList enabled={!modal.disabled} kind={kind} onSelectFavorite={(favorite) => handleSelectFavorite(favorite)} />
              </Col>
            </Row>
          </fieldset>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          {transactionSeq === 0 && (
            <Button disabled={modal.disabled} variant="primary" onClick={handleConfirmReInputClick}>
              저장후 다시입력({getReConfirmKey()})
            </Button>
          )}
          <Button disabled={modal.disabled} variant="primary" onClick={handleConfirmClick}>
            저장({getConfirmKey()})
          </Button>
          <Button variant="secondary" onClick={modal.close}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <TransactionCategoryModal ref={categoryModalRef} onSelect={handleOnSelect} />
    </>
  );
});
TransactionModal.displayName = 'TransactionModal';

export default TransactionModal;
