import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import AccountModal, { AccountModalHandle } from './AccountModal';
import { ResAccountModel } from '../../../common/ResModel';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import { CodeKind } from '../../../common/CommonType';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToCommaDecimal, showDeleteDialog, toBr } from '../util/util';
import IpcCaller from '../../common/IpcCaller';

export interface AccountReadModalHandle {
  openAccountReadModal: (accountSeq: number) => void;
  hideTradeModal: () => void;
}

export interface AccountReadPropsMethods {
  onChange: () => void;
}

const AccountReadModal = forwardRef<AccountReadModalHandle, AccountReadPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState<ResAccountModel>({
    accountSeq: 1,
    assetType: 1,
    accountType: 1,
    name: '',
    balance: [],
    stockBuyPrice: [],
    interestRate: '',
    term: '',
    accountNumber: '',
    monthlyPay: '',
    transferDate: '',
    expDate: '',
    note: '',
    stockF: false,
    enableF: true,
  });
  const accountModalRef = useRef<AccountModalHandle>(null);

  useImperativeHandle(ref, () => ({
    openAccountReadModal: (accountSeq: number) => {
      const accountModel = AccountMapper.getList().find((account) => account.accountSeq === accountSeq)!;
      setAccount(accountModel);
      setShowModal(true);
    },
    hideTradeModal: () => setShowModal(false),
  }));

  const deleteAccountConfirm = async () => {
    await IpcCaller.deleteAccount(account.accountSeq);
    props.onChange();
    setShowModal(false);
    return true;
  };
  const handleDeleteClick = () => {
    showDeleteDialog(() => deleteAccountConfirm());
  };

  const handleEditClick = () => {
    if (!accountModalRef.current) {
      return;
    }
    accountModalRef.current.openAccountModal(account.accountSeq);
  };

  const handleSubmit = async () => {
    const { accountSeq } = account;
    await AccountMapper.loadList();
    props.onChange();
    setAccount(AccountMapper.getAccount(accountSeq));
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
                <td>{account.name}</td>
                <th scope="row">계좌(카드)번호</th>
                <td>{account.accountNumber}</td>
              </tr>
              <tr>
                <th scope="row">자산종류</th>
                <td>{CodeMapper.getValue(CodeKind.ASSET_TYPE, account.assetType)}</td>
                <th scope="row">계좌성격</th>
                <td>{CodeMapper.getValue(CodeKind.ACCOUNT_TYPE, account.accountType)}</td>
              </tr>
              <tr>
                <th scope="row">잔고</th>
                <td>
                  {account.balance.map((balance) => {
                    return (
                      <React.Fragment key={balance.currency}>
                        {CurrencyProperties[balance.currency].symbol}
                        {convertToCommaDecimal(balance.amount, CurrencyProperties[balance.currency].decimalPlace)}
                        <br />
                      </React.Fragment>
                    );
                  })}
                </td>
                <th scope="row">주식매입가</th>
                <td>
                  {account.stockBuyPrice.map((balance) => {
                    return (
                      <React.Fragment key={balance.currency}>
                        {CurrencyProperties[balance.currency].symbol}
                        {convertToCommaDecimal(balance.amount, CurrencyProperties[balance.currency].decimalPlace)}
                        <br />
                      </React.Fragment>
                    );
                  })}
                </td>
              </tr>
              <tr>
                <th scope="row">이율</th>
                <td>{account.interestRate}</td>
                <th scope="row">계약기간</th>
                <td>{account.term}</td>
              </tr>
              <tr>
                <th scope="row">만기일</th>
                <td>{account.expDate}</td>
                <th scope="row">월 납입액</th>
                <td>{account.monthlyPay}</td>
              </tr>
              <tr>
                <th scope="row">이체일</th>
                <td>{account.transferDate}</td>
                <th scope="row">메모 내용</th>
                <td>{toBr(account.note)}</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className="bg-dark text-white-50">
          <Button variant="primary" onClick={handleEditClick}>
            수정
          </Button>
          <Button variant="danger" onClick={handleDeleteClick}>
            삭제
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <AccountModal ref={accountModalRef} onSubmit={handleSubmit} />
    </>
  );
});
AccountReadModal.displayName = 'AccountReadModal';

export default AccountReadModal;
