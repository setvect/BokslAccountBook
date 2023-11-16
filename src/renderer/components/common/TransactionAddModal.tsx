import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

export interface TransactionAddModalHandle {
  openModal: (type: string, saveCallback: () => void) => void;
  hideModal: () => void;
}

const TransactionAddModal = forwardRef<TransactionAddModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<String>();
  const [onSave, setOnSave] = useState<(() => void) | null>(null);

  useImperativeHandle(ref, () => ({
    openModal: (t: string, saveCallback?: () => void) => {
      setShowModal(true);
      setType(t);
      if (saveCallback) {
        setOnSave(() => saveCallback);
      }
    },
    hideModal: () => setShowModal(false),
  }));

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="modal-xl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>지출 내역 등록 {type}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Form>
          <Row>
            <Form.Group as={Col}>
              <Form.Label>날짜:</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Label>금액:</Form.Label>
              <Form.Control type="number" placeholder="금액을 입력하세요" />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col}>
              <Form.Label>메모:</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col}>
              <Form.Label>분류:</Form.Label>
              <Form.Control as="select">{/* 분류 옵션을 반복문으로 생성하거나 직접 작성 */}</Form.Control>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Label>지출계좌:</Form.Label>
              <Form.Control as="select">{/* 계좌 옵션을 반복문으로 생성하거나 직접 작성 */}</Form.Control>
            </Form.Group>
          </Row>
          {/* 추가적인 필드와 버튼 등 */}
        </Form>
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

export default TransactionAddModal;
