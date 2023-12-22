import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import mainImage from '../../images/about.png';
import Constant from '../../../common/Constant';

export interface AboutBokslAccountBookModalHandle {
  openAboutBokslAccountModal: () => void;
  hideAboutBokslAccountModal: () => void;
}

const AboutBokslAccountBookModal = forwardRef<AboutBokslAccountBookModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  useImperativeHandle(ref, () => ({
    openAboutBokslAccountModal: () => {
      setShowModal(true);
    },
    hideAboutBokslAccountModal: () => setShowModal(false),
  }));

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col sm={5} style={{ textAlign: 'center' }}>
            <img src={mainImage} alt="img" style={{ width: '150px', borderRadius: '50%' }} />
          </Col>
          <Col sm={7}>
            <h3>복슬가계부</h3>
            <p>Version {Constant.VERSION_STRING}</p>
            <p>
              <a href="https://github.com/setvect/BokslAccountBook" target="_blank" rel="noreferrer">
                소스코드
              </a>
            </p>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
AboutBokslAccountBookModal.displayName = 'AboutBokslAccountBookModal';

export default AboutBokslAccountBookModal;
