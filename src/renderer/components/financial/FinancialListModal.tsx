import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Row, Table } from 'react-bootstrap';
import moment from 'moment';
import { TransactionKind, TransactionKindProperties } from '../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';
import { downloadForTable } from '../util/util';

export interface FinancialListModalHandle {
  openModal: (type: TransactionKind, year: number, month: number) => void;
}

const FinancialListModal = forwardRef<FinancialListModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  const [type, setType] = useState<TransactionKind>(TransactionKind.EXPENSE);
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());

  useImperativeHandle(ref, () => ({
    openModal: (t: TransactionKind, year: number, month: number) => {
      setType(t);
      setFrom(new Date(year, month - 1, 1));
      setTo(new Date(year, month, 0));
      setShowModal(true);
    },
  }));

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownload = () => {
    downloadForTable(
      tableRef,
      `${TransactionKindProperties[type].label}_결산내역_${moment(from).format('YYYY.MM.DD')}_${moment(to).format('YYYY.MM.DD')}.xls`,
    );
  };

  return (
    <Modal dialogClassName="modal-xl" show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {moment(from).format('YYYY.MM.DD')} ~ {moment(to).format('YYYY.MM.DD')} {TransactionKindProperties[type].label} 내역 (총: 000,000원)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Table striped bordered hover className="table-th-center table-font-size" ref={tableRef}>
            <thead>
              <tr>
                <th>No</th>
                <th>유형</th>
                <th>메모</th>
                <th>대분류</th>
                <th>소분류</th>
                <th>금액</th>
                <th>수수료</th>
                <th>출금계좌</th>
                <th>입금계좌</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <span className={TransactionKindProperties[type].color}>지출</span>
                </td>
                <td>월세</td>
                <td>주거비</td>
                <td>월세</td>
                <td className="right">10,000</td>
                <td className="right">0</td>
                <td>복슬통장</td>
                <td>&nbsp;</td>
                <td>2023.04.05</td>
              </tr>
            </tbody>
          </Table>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={() => handleDownload()}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
FinancialListModal.displayName = 'ExchangeModal';

export default FinancialListModal;
