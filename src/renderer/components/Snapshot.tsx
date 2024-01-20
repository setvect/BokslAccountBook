import { Container } from 'react-bootstrap';
import React from 'react';
import SnapshotList from './snapshot/SnapshotList';

function Snapshot() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>자산 스냅샷</h2>
      <SnapshotList />
    </Container>
  );
}

export default Snapshot;
