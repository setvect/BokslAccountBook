import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import CodeMapper, { CodeKind } from '../../mapper/CodeMapper';
import { downloadForTable } from '../util/util';

export interface AssetSnapshotReadModelHandle {
  openAssetSnapshotReadModal: (assetSnapshotSeq: number) => void;
  hideAssetSnapshotReadModal: () => void;
}

const AssetSnapshotReadModal = forwardRef<AssetSnapshotReadModelHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const reportRef = useRef<HTMLTableElement>(null);

  useImperativeHandle(ref, () => ({
    openAssetSnapshotReadModal: (assetSnapshotSeq: number) => {
      // TODO 내용 불러오기
      setShowModal(true);
    },
    hideAssetSnapshotReadModal: () => setShowModal(false),
  }));
  const handleDownloadClick = () => {
    downloadForTable(reportRef, `자산스냅샷 - 2023년 11월 30일.xls`);
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl" centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          2023년 11월 30일 <em>작성일: 2023.12.01</em>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50" ref={reportRef}>
        <Row className="mb-3">
          <Col>
            <h5>원화(KRW) 기준환율</h5>
            <ul className="horizontal-list">
              <li>
                USD: <span className="highlight">1,330.12</span>
              </li>
              <li>
                JPY: <span className="highlight">9.23</span>
              </li>
            </ul>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>계좌 성격별 통계(원화 환산)</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getCodeSubList(CodeKind.ACCOUNT_TYPE).map((item) => (
                  <tr key={item.codeSeq}>
                    <td>{item.name}</td>
                    <td className="right">1,000,000</td>
                    <td className="right">1,100,000</td>
                    <td className="right account-buy">100,000</td>
                    <td className="right account-buy">10.00</td>
                    <td className="right">20.00</td>
                    <td className="right">20.00</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">1,000,000</td>
                  <td className="right">1,100,000</td>
                  <td className="right">100,000</td>
                  <td className="right">10.00</td>
                  <td className="right">20.00</td>
                  <td className="right">20.00</td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 종류별 통계</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getCodeSubList(CodeKind.STOCK_TYPE).map((item) => (
                  <tr key={item.codeSeq}>
                    <td>{item.name}</td>
                    <td className="right">1,000,000</td>
                    <td className="right">1,100,000</td>
                    <td className="right account-buy">100,000</td>
                    <td className="right account-buy">10.00</td>
                    <td className="right">20.00</td>
                    <td className="right">20.00</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">1,000,000</td>
                  <td className="right">1,100,000</td>
                  <td className="right">100,000</td>
                  <td className="right">10.00</td>
                  <td className="right">20.00</td>
                  <td className="right">20.00</td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 국가별 통계</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th>계좌성격</th>
                  <th>합산금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률</th>
                  <th>합산금액 비중(%)</th>
                  <th>평가금액 비중(%)</th>
                </tr>
              </thead>
              <tbody>
                {CodeMapper.getCodeSubList(CodeKind.NATION_TYPE).map((item) => (
                  <tr key={item.codeSeq}>
                    <td>{item.name}</td>
                    <td className="right">1,000,000</td>
                    <td className="right">1,100,000</td>
                    <td className="right account-buy">100,000</td>
                    <td className="right account-buy">10.00</td>
                    <td className="right">20.00</td>
                    <td className="right">20.00</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td className="right">1,000,000</td>
                  <td className="right">1,100,000</td>
                  <td className="right">100,000</td>
                  <td className="right">10.00</td>
                  <td className="right">20.00</td>
                  <td className="right">20.00</td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 종목별 성과</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>기준통화</th>
                  <th>연결계좌</th>
                  <th>종류</th>
                  <th>상장국가</th>
                  <th>매수금액</th>
                  <th>평가금액</th>
                  <th>수익금</th>
                  <th>수익률(%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>복슬전자</td>
                  <td>KRW</td>
                  <td>복슬증권</td>
                  <td>개별종목</td>
                  <td>국내</td>
                  <td className="right">₩200,000</td>
                  <td className="right">₩220,000</td>
                  <td className="right account-buy">₩20,000</td>
                  <td className="right account-buy">10.00</td>
                </tr>
                <tr>
                  <td>복슬소프트</td>
                  <td>USD</td>
                  <td>복슬증권</td>
                  <td>개별종목</td>
                  <td>미국</td>
                  <td className="right">$10,000.00</td>
                  <td className="right">$9,000.00</td>
                  <td className="right account-sell">$-1,000.00</td>
                  <td className="right account-sell">-10.00</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <h5>주식 매도 내역(기간: 2023.05.31 ~ 2023.12.01)</h5>
            <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>기준통화</th>
                  <th>연결계좌</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>합산금액</th>
                  <th>매도착익</th>
                  <th>수익률(%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>복슬전자</td>
                  <td>KRW</td>
                  <td>복슬증권</td>
                  <td className="right">10</td>
                  <td className="right">₩12,000</td>
                  <td className="right">₩120,000</td>
                  <td className="right account-buy">₩1,000</td>
                  <td className="right account-buy">5.12</td>
                </tr>
                <tr>
                  <td>복슬소프트</td>
                  <td>USD</td>
                  <td>복슬증권</td>
                  <td className="right">20</td>
                  <td className="right">$520.25</td>
                  <td className="right">$9,000.00</td>
                  <td className="right account-sell">$-1,000.00</td>
                  <td className="right account-sell">-10.00</td>
                </tr>
              </tbody>
            </Table>
          </Col>
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
AssetSnapshotReadModal.displayName = 'AssetSnapshotModal';
export default AssetSnapshotReadModal;
