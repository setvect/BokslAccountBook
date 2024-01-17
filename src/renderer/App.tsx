import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import 'react-datepicker/dist/react-datepicker.css';
import AboutBokslAccountBookModal, { AboutBokslAccountBookModalHandle } from './components/etc/AboutBokslAccountBookModal';
import { IPC_CHANNEL } from '../common/CommonType';
import Login from './components/Login';
import Main from './Main';
import { showWarnDialog } from './components/util/util';
import { ResErrorModel } from '../common/ResModel';

function App() {
  const aboutBokslAccountBookModalRef = useRef<AboutBokslAccountBookModalHandle>(null);

  useEffect(() => {
    const aboutBokslListener = window.electron.ipcRenderer.on(IPC_CHANNEL.PageAboutBoksl, () => {
      aboutBokslAccountBookModalRef.current?.openAboutBokslAccountModal();
    });

    // IPC통해 받은 에러메시지 처리. 전역처리
    const commonErrorListener = window.electron.ipcRenderer.on(IPC_CHANNEL.ErrorCommon, (message: any) => {
      console.error(message);
      const errorMessage = message as ResErrorModel;
      showWarnDialog(errorMessage.message);
    });

    return () => {
      aboutBokslListener();
      commonErrorListener();
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
