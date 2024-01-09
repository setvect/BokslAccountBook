import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { showWarnDialog } from './util/util';
import IpcCaller from '../common/IpcCaller';

function LoginForm() {
  const DEFAULT_PASSWORD = 'boksl';
  // 초기 비밀번호로 로그인되는지 판단
  const [possibleDefaultLogin, setPossibleDefaultLogin] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = passwordRef.current?.value;
    if (password) {
      const login = await IpcCaller.login(password);
      if (login) {
        navigate('/main/LedgerCalendar');
      } else {
        showWarnDialog('비밀번호가 틀렸습니다.');
      }
    } else {
      showWarnDialog('비밀번호를 입력하세요');
    }
  };

  useEffect(() => {
    passwordRef.current?.focus();
    (async () => {
      const login = await IpcCaller.login(DEFAULT_PASSWORD);
      setPossibleDefaultLogin(!!login);
    })();
    // TODO 개발 완료후 삭제
    navigate('/main/LedgerCalendar');
  }, [navigate]);

  return (
    <Container style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '500px' }}>
      <Row>
        <Col md={12} className="bg-dark p-5 rounded">
          <Form style={{ width: '400px' }} onSubmit={handleSubmit}>
            <h2 className="mb-5 text-white">복슬가계부</h2>
            {possibleDefaultLogin && (
              <p className="text-center" style={{ color: '#bbb' }}>
                초기 비밀번호: <code>{DEFAULT_PASSWORD}</code>
              </p>
            )}
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
