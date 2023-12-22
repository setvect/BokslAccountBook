import React, { Suspense, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Col, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import Menu from './Menu';
import AboutBokslAccountBookModal, { AboutBokslAccountBookModalHandle } from './AboutBokslAccountBook';
import { IPC_CHANNEL } from '../common/CommonType';

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RedirectToLedgerTable() {
  const navigate = useNavigate();
  useEffect(
    () => {
      navigate('CategoryManagement');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return null;
}

function Main() {
  const aboutBokslAccountBookModalRef = useRef<AboutBokslAccountBookModalHandle>(null);

  useEffect(() => {
    const handleAboutBoksl = () => {
      aboutBokslAccountBookModalRef.current?.openAboutBokslAccountModal();
    };

    const removeListener = window.electron.ipcRenderer.on(IPC_CHANNEL.about_boksl, handleAboutBoksl);

    // 클린업 함수
    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      <Menu />
      <Col style={{ padding: '20px' }} className="color-theme-content-bg">
        {/* <RedirectToLedgerTable /> */}
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
      </Col>
    </>
  );
}

export default Main;
