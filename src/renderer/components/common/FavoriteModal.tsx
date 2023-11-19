import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Select, { GroupBase } from 'react-select';
import { FavoriteModalForm, Kind, OptionType } from './BokslTypes';
import darkThemeStyles from './BokslConstant';
import AttributeModal, { AttributeModalHandle } from './AttributeModal';

export interface FavoriteModalHandle {
  openModal: (favoriteSeq: number, selectCallback: () => void) => void;
  hideModal: () => void;
}

const FavoriteModal = forwardRef<FavoriteModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<(() => void) | null>(null);
  const attributeModalRef = useRef<AttributeModalHandle>(null);
  const focusRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FavoriteModalForm>({
    title: '',
    categorySeq: 0,
    kind: Kind.INCOME,
    note: '',
    money: 0,
    payAccount: 0,
    receiveAccount: 0,
    attribute: '',
  });

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

  useImperativeHandle(ref, () => ({
    openModal: (favoriteSeq: number, setAttribute?: () => void) => {
      if (setAttribute) {
        setShowModal(true);
        setConfirm(() => setAttribute);
      }
    },
    hideModal: () => setShowModal(false),
  }));
  function clickAttribute() {
    attributeModalRef.current?.openModal(1, () => {
      console.log('callback');
    });
  }

  useEffect(() => {
    focusRef.current?.focus();
  });

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>자주쓰는 거래</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Row>
            <Col>
              <Form>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    거래제목
                  </Form.Label>
                  <Col sm={10}>
                    <Form.Control ref={focusRef} onChange={(e) => setForm((prevForm) => ({ ...prevForm, note: e.target.value }))} value={form.note} />
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
              </Form>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          <Button
            variant="primary"
            onClick={() => {
              confirm?.();
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
FavoriteModal.displayName = 'FavoriteModal';

export default FavoriteModal;
