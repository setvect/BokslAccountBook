import { Button, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp, FaEdit, FaTrash } from 'react-icons/fa';
import React, { useEffect, useRef } from 'react';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import FavoriteModal, { FavoriteModalHandle } from './FavoriteModal';
import { TransactionKind } from '../../common/BokslTypes';
import { showDeleteDialog } from '../util/util';

interface FavoriteListProps {
  kind: TransactionKind;
}

function FavoriteList({ kind }: FavoriteListProps) {
  const rows = Array.from({ length: 10 }, (_, index) => index);
  const favoriteModalRef = useRef<FavoriteModalHandle>(null);

  const handleOpenFavoriteClick = () => {
    favoriteModalRef.current?.openFavoriteModal(0, kind, () => {
      console.log('openFavoriteModal callback');
    });
  };

  useEffect(() => {
    // openFavoriteModal();
  }, []);

  function handleEditFavoriteClick(favoriteSeq: number) {
    favoriteModalRef.current?.openFavoriteModal(favoriteSeq, kind, () => {
      console.log('openFavoriteModal callback');
    });
  }

  function handleDeleteFavoriteClick(favoriteSeq: number) {
    showDeleteDialog(() => {
      console.log('삭제 처리');
    });
  }

  return (
    <>
      자주쓰는 거래
      <div style={{ height: '380px', overflow: 'auto' }}>
        <Table striped bordered hover style={{ fontSize: '0.9em' }} className="favorite">
          <tbody>
            {rows.map((index) => (
              <tr key={index}>
                <td style={{ textAlign: 'center' }}>{index}</td>
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
                  {index > 0 && (
                    <Button variant="link" onClick={() => {}}>
                      <FaArrowUp />
                    </Button>
                  )}
                  {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                  {index < rows.length - 1 && (
                    <Button variant="link" onClick={() => {}}>
                      <FaArrowDown />
                    </Button>
                  )}
                  {index === rows.length - 1 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button variant="link" onClick={() => handleEditFavoriteClick(index)}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={() => handleDeleteFavoriteClick(index)}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Button onClick={handleOpenFavoriteClick} size="sm" variant="outline-secondary" style={{ marginTop: '10px' }}>
        자주쓰는 거래 저장
      </Button>
      <FavoriteModal ref={favoriteModalRef} />
    </>
  );
}

export default FavoriteList;
