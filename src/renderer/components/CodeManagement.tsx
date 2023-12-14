import { Container } from 'react-bootstrap';
import React from 'react';
import Code from './code/Code';

function CodeManagement() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>코드관리</h2>
      <Code />
    </Container>
  );
}

export default CodeManagement;
