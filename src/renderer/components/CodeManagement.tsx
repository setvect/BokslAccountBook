import { Container } from 'react-bootstrap';
import React from 'react';
import CodeList from './code/CodeList';

function CodeManagement() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>코드관리</h2>
      <CodeList />
    </Container>
  );
}

export default CodeManagement;
