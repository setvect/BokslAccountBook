import React from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

interface ExpenseModalProps {
  show: boolean;
  onHide: () => void;
}

function TransactionAddModal({ show, onHide }: ExpenseModalProps) {
  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>지출 내역 등록</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          닫기
        </Button>
        <Button variant="primary">저장</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TransactionAddModal;
