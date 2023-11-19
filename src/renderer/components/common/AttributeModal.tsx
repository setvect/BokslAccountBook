import { Button, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import _ from 'lodash';

export interface AttributeModalHandle {
  openModal: (attributeSeq: number, selectCallback: () => void) => void;
  hideModal: () => void;
}

const AttributeModal = forwardRef<AttributeModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [onSave, setOnSave] = useState<(() => void) | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');

  const options = _.map(_.range(1, 10), (value: number) => ({
    value: `${value}`,
    label: `옵션 ${value}`,
  }));

  useImperativeHandle(ref, () => ({
    openModal: (attributeSeq: number, setAttribute?: () => void) => {
      if (setAttribute) {
        setShowModal(true);
        setOnSave(() => setAttribute);
      }
    },
    hideModal: () => setShowModal(false),
  }));

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>항목 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <div style={{ height: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {options.map((option: any) => (
                  <ListGroup.Item
                    key={option.value}
                    action
                    active={option.value === selectedItem}
                    onClick={(value) => {
                      console.log('option', option);
                      console.log('option.value', option.value);
                      setSelectedItem(option.value);
                    }}
                  >
                    {option.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Col>
          <Col>
            <div style={{ height: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {options.map((option: any) => (
                  <ListGroup.Item
                    key={option.value}
                    action
                    active={option.value === selectedItem}
                    onClick={(value) => {
                      console.log('option', option);
                      console.log('option.value', option.value);
                      setSelectedItem(option.value);
                    }}
                  >
                    {option.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
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
  );
});
AttributeModal.displayName = 'AttributeModal';

export default AttributeModal;
