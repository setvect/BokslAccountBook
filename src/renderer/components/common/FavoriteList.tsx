import { Button, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaEdit, FaTrash } from 'react-icons/fa';
import React, { useEffect, useRef } from 'react';
import FavoriteModal, { FavoriteModalHandle } from './FavoriteModal';

function FavoriteList() {
  const rows = Array.from({ length: 10 }, (_, index) => index + 1);
  const favoriteModalRef = useRef<FavoriteModalHandle>(null);

  function openFavoriteModal() {
    favoriteModalRef.current?.openModal(0, () => {});
  }

  useEffect(() => {}, []);

  return (
    <>
      자주쓰는 거래
      <div style={{ height: '380px', overflow: 'auto' }}>
        <Table striped bordered hover style={{ fontSize: '0.9em' }}>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <td style={{ textAlign: 'center' }}>{row}</td>
                <td>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    variant="link"
                    style={{ padding: '0' }}
                  >
                    주식/부식 &gt; 점심 식대
                  </Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <FaArrowUp style={{ margin: '0 3px' }} />
                  <FaArrowDown style={{ margin: '0 3px' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <FaEdit style={{ margin: '0 3px' }} />
                  <FaTrash style={{ margin: '0 3px' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Button onClick={() => openFavoriteModal()} size="sm" variant="outline-secondary" style={{ marginTop: '10px' }}>
        자주쓰는 거래 저장
      </Button>
      <FavoriteModal ref={favoriteModalRef} />
    </>
  );
}

export default FavoriteList;
