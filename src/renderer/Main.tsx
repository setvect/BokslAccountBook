import React, { Suspense, useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Col, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import Menu from './Menu';
import { IPC_CHANNEL } from '../common/CommonType';
import PasswordChangeModal, { PasswordChangeModalHandle } from './components/etc/PasswordChangeModal';

const LedgerCalendar = React.lazy(() => import('./components/LedgerCalendar'));
const LedgerTable = React.lazy(() => import('./components/LedgerTable'));
const FinancialSettlement = React.lazy(() => import('./components/FinancialSettlement'));
const Statistics = React.lazy(() => import('./components/Statistics'));
const CategoryManagement = React.lazy(() => import('./components/CategoryManagement'));
const AccountManagement = React.lazy(() => import('./components/AccountManagement'));
const Stocks = React.lazy(() => import('./components/Stocks'));
const AssetSnapshot = React.lazy(() => import('./components/AssetSnapshot'));
const CodeManagement = React.lazy(() => import('./components/CodeManagement'));

function Wait() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

function Main() {
  const passwordChangeModalRef = useRef<PasswordChangeModalHandle>(null);

  useEffect(() => {
    const changePasswordRemoveListener = window.electron.ipcRenderer.on(IPC_CHANNEL.change_password, () => {
      passwordChangeModalRef.current?.openPasswordChangeModal();
    });

    // 클린업 함수
    return () => {
      changePasswordRemoveListener();
    };
  }, []);

  return (
    <>
      <Menu />
      <Col style={{ padding: '20px' }} className="color-theme-content-bg">
        <Suspense fallback={<Wait />}>
          <Routes>
            <Route path="" element={<LedgerCalendar />} />
            <Route path="LedgerTable" element={<LedgerTable />} />
            <Route path="FinancialSettlement" element={<FinancialSettlement />} />
            <Route path="Statistics" element={<Statistics />} />
            <Route path="CategoryManagement" element={<CategoryManagement />} />
            <Route path="AccountManagement" element={<AccountManagement />} />
            <Route path="Stocks" element={<Stocks />} />
            <Route path="AssetSnapshot" element={<AssetSnapshot />} />
            <Route path="CodeManagement" element={<CodeManagement />} />
          </Routes>
        </Suspense>
        {/* 로그인 된 이후 비번 수정 가능하도록 하기 위해 Main 컴포넌트에 포함시킴  */}
        <PasswordChangeModal ref={passwordChangeModalRef} />
      </Col>
    </>
  );
}

export default Main;
