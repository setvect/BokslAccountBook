import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import AboutBokslAccountBookModal, { AboutBokslAccountBookModalHandle } from './components/etc/AboutBokslAccountBookModal';
import { IPC_CHANNEL } from '../common/CommonType';
import Login from './components/Login';
import Main from './Main';
import PasswordChangeModal, { PasswordChangeModalHandle } from './components/etc/PasswordChangeModal';

function App() {
  const aboutBokslAccountBookModalRef = useRef<AboutBokslAccountBookModalHandle>(null);
  const passwordChangeModalRef = useRef<PasswordChangeModalHandle>(null);

  useEffect(() => {
    const aboutBokslRemoveListener = window.electron.ipcRenderer.on(IPC_CHANNEL.about_boksl, () => {
      aboutBokslAccountBookModalRef.current?.openAboutBokslAccountModal();
    });
    const changePasswordRemoveListener = window.electron.ipcRenderer.on(IPC_CHANNEL.change_password, () => {
      passwordChangeModalRef.current?.openPasswordChangeModal();
    });

    // 클린업 함수
    return () => {
      aboutBokslRemoveListener();
      changePasswordRemoveListener();
    };
  }, []);

  return (
    <Container fluid style={{ minHeight: '100vh' }} data-bs-theme="dark">
      <Row style={{ minHeight: '100vh' }}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main/*" element={<Main />} />
          </Routes>
        </Router>
      </Row>
      <AboutBokslAccountBookModal ref={aboutBokslAccountBookModalRef} />
    </Container>
  );
}

export default App;
