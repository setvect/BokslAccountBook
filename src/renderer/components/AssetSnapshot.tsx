import { Container } from 'react-bootstrap';
import React from 'react';
import AssetSnapshotList from './asset/AssetSnapshotList';

function AssetSnapshot() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>자산 스냅샷</h2>
      <AssetSnapshotList />
    </Container>
  );
}

export default AssetSnapshot;
