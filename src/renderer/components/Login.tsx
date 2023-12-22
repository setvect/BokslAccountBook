import React, { useRef, useEffect, FormEvent } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { showWarnDialog } from './util/util';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = passwordRef.current?.value;
    if (password) {
      // window.electron.ipcRenderer.send('login', password);
      navigate('/main');
    } else {
      showWarnDialog('비밀번호를 입력하세요');
    }
  };

  return (
    <Container style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '500px' }}>
      <Row>
        <Col md={12} className="bg-dark p-5 rounded">
          <Form style={{ width: '400px' }} onSubmit={handleSubmit}>
            <h2 className="mb-5 text-white">복슬가계부</h2>
            <Form.Group className="mb-5" controlId="formBasicPassword">
              <Form.Control ref={passwordRef} type="password" placeholder="비밀번호 입력" />
            </Form.Group>
            <div className="text-center">
              <Button variant="light" type="submit">
                로그인
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;
