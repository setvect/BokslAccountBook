import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Row, Table } from 'react-bootstrap';
import moment from 'moment';
import { TradeKindProperties } from '../../common/RendererModel';
import { downloadForTable } from '../util/util';
import { TradeKind } from '../../../common/CommonType';

export interface FinancialTradeListModalHandle {
  openModal: (type: TradeKind, year: number, month: number) => void;
}

const FinancialTradeListModal = forwardRef<FinancialTradeListModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  const [type, setType] = useState<TradeKind>(TradeKind.BUY);
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());

  useImperativeHandle(ref, () => ({
    openModal: (t: TradeKind, year: number, month: number) => {
      setType(t);
      setFrom(new Date(year, month - 1, 1));
      setTo(new Date(year, month, 0));
      setShowModal(true);
    },
  }));

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `${TradeKindProperties[type].label}_내역_${moment(from).format('YYYY.MM.DD')}_${moment(to).format('YYYY.MM.DD')}.xls`);
  };

  return (
    <Modal dialogClassName="modal-xl" show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {moment(from).format('YYYY.MM.DD')} ~ {moment(to).format('YYYY.MM.DD')} {TradeKindProperties[type].label} 내역 (총: 000,000원)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Table striped bordered hover className="table-th-center table-font-size" ref={tableRef}>
            <thead>
              <tr>
                <th>No</th>
                <th>유형</th>
                <th>내용</th>
                <th>종목</th>
                <th>수량</th>
                <th>단가</th>
                <th>합산금액</th>
                <th>매도차익</th>
                <th>손익률</th>
                <th>거래세</th>
                <th>수수료</th>
                <th>거래계좌</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="center">
                  <span className={TradeKindProperties[type].color}>{TradeKindProperties[type].label}</span>
                </td>
                <td>물타기</td>
                <td>복슬철강</td>
                <td className="right">2</td>
                <td className="right">10,000</td>
                <td className="right">20,000</td>
                <td className="right">&nbsp;</td>
                <td className="right">&nbsp;</td>
                <td className="right">0</td>
                <td className="right">10</td>
                <td>복슬증권</td>
                <td>2021-01-01</td>
              </tr>
            </tbody>
          </Table>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={() => handleDownloadClick()}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
FinancialTradeListModal.displayName = 'FinancialTradeListModal';

export default FinancialTradeListModal;
