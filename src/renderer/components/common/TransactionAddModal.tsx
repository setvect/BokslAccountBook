import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase, StylesConfig } from 'react-select';
import { NumericFormat } from 'react-number-format';
import { AccountType, Kind, OptionType, TransactionModalForm } from './BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import FavoriteTransactions from './FavoriteTransactions';
import AttributeModal, { AttributeModalHandle } from './AttributeModal';

export interface TransactionAddModalHandle {
  openModal: (type: AccountType, item: TransactionModalForm, saveCallback: () => void) => void;
  hideModal: () => void;
}

const darkThemeStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (styles, { isDisabled }) => ({
    ...styles,
    backgroundColor: isDisabled ? '#343a40' : '#212529',
    color: '#dee2e6',
    borderColor: isDisabled ? '#495057' : '#495057',
  }),
  singleValue: (styles) => ({
    ...styles,
    color: '#dee2e6',
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#212529',
    color: 'white',
  }),
  option: (styles, { isFocused, isSelected }) => {
    let backgroundColor = 'black';
    if (isFocused) {
      backgroundColor = '#33394a';
    } else if (isSelected) {
      backgroundColor = '#5d5e5f';
    }
    return {
      ...styles,
      backgroundColor,
      color: '#8e9092',
    };
  },
};

const TransactionAddModal = forwardRef<TransactionAddModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<String>();
  const [onSave, setOnSave] = useState<(() => void) | null>(null);
  const attributeModalRef = useRef<AttributeModalHandle>(null);

  const [form, setForm] = useState<TransactionModalForm>({
    transactionDate: new Date(),
    categorySeq: 0,
    kind: Kind.INCOME,
    note: '',
    money: 0,
    payAccount: 0,
    receiveAccount: 0,
    attribute: '',
    fee: 0,
  });

  useImperativeHandle(ref, () => ({
    openModal: (t: string, item: TransactionModalForm, saveCallback?: () => void) => {
      setShowModal(true);
      setForm(item);
      setType(t);
      if (saveCallback) {
        setOnSave(() => saveCallback);
      }
    },
    hideModal: () => setShowModal(false),
  }));

  const options = [
    { value: 1, label: '계좌 1' },
    { value: 2, label: '계좌 2' },
    { value: 3, label: '계좌 3' },
  ];

  const options1 = [
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' },
    { value: '3', label: '옵션 3' },
  ];

  useEffect(() => {
    console.log(form);
  }, [form]);

  function changeTransactionDate(diff: number) {
    const d = form.transactionDate.getDate() + diff;
    form.transactionDate.setDate(d);
    setForm((prevForm) => ({
      ...prevForm,
      transactionDate: form.transactionDate,
    }));
  }

  function clickAttribute() {
    attributeModalRef.current?.openModal(1, () => {
      console.log('callback');
    });
  }

  // 컴포넌트가 처음 마운트 되었을 때 한번만 실행
  useEffect(() => {
    clickAttribute();
  }, []);
  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="modal-xl" centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>지출 내역 등록 {type}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                  <Form.Label column sm={2}>
                    날짜
                  </Form.Label>
                  <Col sm={10}>
                    <Row>
                      <Col sm={8}>
                        <div className="form-group">
                          <DatePicker
                            dateFormat="yyyy-MM-dd"
                            selected={form.transactionDate}
                            onChange={(date) => {
                              setForm((prevForm) => ({
                                ...prevForm,
                                transactionDate: date || new Date(),
                              }));
                            }}
                            className="form-control"
                          />
                        </div>
                      </Col>
                      <Col>
                        <Button variant="outline-success" onClick={() => changeTransactionDate(-1)}>
                          전날
                        </Button>
                        <Button variant="outline-success" style={{ marginLeft: '5px' }} onClick={() => changeTransactionDate(1)}>
                          다음날
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    항목
                  </Form.Label>
                  <Col sm={10}>
                    <InputGroup>
                      <Form.Control readOnly />
                      <Button variant="outline-secondary" onClick={() => clickAttribute()}>
                        선택
                      </Button>
                    </InputGroup>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    메모
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control onChange={(e) => setForm((prevForm) => ({ ...prevForm, note: e.target.value }))} value={form.note} />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    금액
                  </Form.Label>
                  <Col sm={10}>
                    <NumericFormat
                      thousandSeparator
                      onValueChange={(values) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          money: values.floatValue || 0,
                        }))
                      }
                      value={form.money}
                      maxLength={12}
                      className="form-control"
                      style={{ textAlign: 'right' }}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    지출계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Select<OptionType, false, GroupBase<OptionType>>
                      value={options.find((option) => option.value === form.payAccount)}
                      onChange={(option) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          payAccount: option ? option.value : 0,
                        }))
                      }
                      options={options}
                      placeholder="계좌 선택"
                      className="react-select-container"
                      styles={darkThemeStyles}
                      isClearable
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    수입계좌
                  </Form.Label>
                  <Col sm={10}>
                    <Select<OptionType, false, GroupBase<OptionType>>
                      isDisabled
                      value={options.find((option) => option.value === form.receiveAccount)}
                      onChange={(option) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          receiveAccount: option ? option.value : 0,
                        }))
                      }
                      options={options}
                      placeholder="계좌 선택"
                      className="react-select-container"
                      styles={darkThemeStyles}
                      isClearable
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    속성
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Select value={form.attribute} onChange={(e) => setForm((prevForm) => ({ ...prevForm, attribute: e.target.value }))}>
                      {options1.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                  <Form.Label column sm={2}>
                    금액
                  </Form.Label>
                  <Col sm={10}>
                    <NumericFormat
                      thousandSeparator
                      onValueChange={(values) => setForm((prevForm) => ({ ...prevForm, fee: values.floatValue || 0 }))}
                      value={form.fee}
                      maxLength={8}
                      className="form-control"
                      style={{ textAlign: 'right' }}
                    />
                  </Col>
                </Form.Group>
              </Form>
            </Col>
            <Col>
              <FavoriteTransactions />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          <Button
            variant="primary"
            onClick={() => {
              onSave?.();
              setShowModal(false);
            }}
          >
            저장
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <AttributeModal ref={attributeModalRef} />
    </>
  );
});

TransactionAddModal.displayName = 'TransactionAddModal';

export default TransactionAddModal;
