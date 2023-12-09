import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import AccountModal, { AccountModalHandle } from './AccountModal';
import { ActionType, BalanceModel, Currency, CurrencyProperties } from '../common/BokslTypes';

export interface AccountReadModalHandle {
  openAccountReadModal: (accountSeq: number) => void;
  hideTradeModal: () => void;
}

const AccountReadModal = forwardRef<AccountReadModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const accountModalRef = useRef<AccountModalHandle>(null);

  useImperativeHandle(ref, () => ({
    openAccountReadModal: (accountSeq: number) => {
      setShowModal(true);
    },
    hideTradeModal: () => setShowModal(false),
  }));

  const handleAccountEdit = (actionType: ActionType) => {
    if (!accountModalRef.current) {
      return;
    }
    accountModalRef.current.openAccountModal(
      actionType,
      {
        name: '',
        accountNumber: '',
        kindCode: '',
        accountType: '',
        stockF: false,
        balance: (Object.keys(CurrencyProperties) as Currency[]).map(
          (currency) =>
            ({
              currency,
              amount: 0,
            }) as BalanceModel,
        ),
        interestRate: '',
        term: '',
        expDate: '',
        monthlyPay: '',
        transferDate: '',
        note: '',
        enableF: true,
      },
      () => {
        console.log('save');
      },
    );
  };

  const handleDelete = () => {
    Swal.fire({
      title: '삭제할까요?',
      text: '이 작업은 되돌릴 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '예, 삭제합니다!',
      cancelButtonText: '아니요, 취소합니다!',
      showClass: {
        popup: '',
      },
      hideClass: {
        popup: '',
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          console.log('삭제 처리');
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.error('삭제 작업 중 오류가 발생했습니다:', error);
      });
  };

  const handleEdit = () => {
    if (!accountModalRef.current) {
      return;
    }
    accountModalRef.current.openAccountModal(
      ActionType.EDIT,
      {
        name: '',
        accountNumber: '',
        kindCode: '',
        accountType: '',
        stockF: false,
        balance: (Object.keys(CurrencyProperties) as Currency[]).map(
          (currency) =>
            ({
              currency,
              amount: 0,
            }) as BalanceModel,
        ),
        interestRate: '',
        term: '',
        expDate: '',
        monthlyPay: '',
        transferDate: '',
        note: '',
        enableF: true,
      },
      () => {
        console.log('edit');
      },
    );
  };

  return (
    <>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-white-50">
          <Modal.Title>내용 보기</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white-50">
          <Table striped bordered hover>
            <tbody>
              <tr>
                <th scope="row">이름</th>
                <td>[카드]복슬카드</td>
                <th scope="row">계좌(카드)번호</th>
                <td>0</td>
              </tr>
              <tr>
                <th scope="row">자산종류</th>
                <td>신용카드</td>
                <th scope="row">계좌성격</th>
                <td>부채자산</td>
              </tr>
              <tr>
                <th scope="row">잔고</th>
                <td>
                  ₩ 100,000
                  <br />$ 100,000
                </td>
                <th scope="row">주식매입가</th>
                <td>0</td>
              </tr>
              <tr>
                <th scope="row">이율</th>
                <td>&nbsp;</td>
                <th scope="row">계약기간</th>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <th scope="row">만기일</th>
                <td>&nbsp;</td>
                <th scope="row">월 납입액</th>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <th scope="row">이체일</th>
                <td>&nbsp;</td>
                <th scope="row">메모 내용</th>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          <Button variant="primary" onClick={handleEdit}>
            수정
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <AccountModal ref={accountModalRef} />
    </>
  );
});
AccountReadModal.displayName = 'AccountReadModal';

export default AccountReadModal;
