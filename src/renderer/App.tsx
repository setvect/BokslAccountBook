import React, { useEffect, useRef, useState } from 'react';
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
import IpcRequestError from '../common/ipc/IpcRequestError';
import FindBox from './components/etc/FindBox';

function App() {
  const [findOpen, setFindOpen] = useState(false);
  const aboutBokslAccountBookModalRef = useRef<AboutBokslAccountBookModalHandle>(null);
  const hideFindBox = () => {
    setFindOpen(false);
  };

  useEffect(() => {
    const onUnhandledRequest = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof IpcRequestError) {
        event.preventDefault();
        showWarnDialog(event.reason.message);
      }
    };
    window.addEventListener('unhandledrejection', onUnhandledRequest);
    return () => window.removeEventListener('unhandledrejection', onUnhandledRequest);
  }, []);

  useEffect(() => {
    return window.electron.ipcRenderer.on(IPC_CHANNEL.FindOpen, () => {
      setFindOpen((open) => !open);
    });
  }, []);

  useEffect(() => {
    const aboutBokslListener = window.electron.ipcRenderer.on(IPC_CHANNEL.PageAboutBoksl, () => {
      aboutBokslAccountBookModalRef.current?.openAboutBokslAccountModal();
    });

    return () => {
      aboutBokslListener();
    };
  }, []);

  return (
    <Container fluid style={{ minHeight: '100vh' }} data-bs-theme="dark">
      <FindBox isVisible={findOpen} onHide={hideFindBox} />
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
