import { Button, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import React, { useEffect, useRef, useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import FavoriteModal, { FavoriteModalHandle } from './FavoriteModal';
import { ResFavoriteModel, TransactionKind } from '../../common/BokslTypes';
import { showDeleteDialog } from '../util/util';
import FavoriteMapper from '../../mapper/FavoriteMapper';

interface FavoriteListProps {
  onSelectFavorite: (favorite: ResFavoriteModel) => void;
  kind: TransactionKind;
}

function FavoriteList({ onSelectFavorite, kind }: FavoriteListProps) {
  const favoriteModalRef = useRef<FavoriteModalHandle>(null);

  const [favoriteList, setFavoriteList] = useState<ResFavoriteModel[]>(FavoriteMapper.getFavoriteList(kind));

  const handleOpenFavoriteClick = () => {
    favoriteModalRef.current?.openFavoriteModal(0, kind, () => {
      console.log('openFavoriteModal callback');
    });
  };

  useEffect(() => {
    // openFavoriteModal();
  }, []);

  const handleEditFavoriteClick = (favoriteSeq: number) => {
    favoriteModalRef.current?.openFavoriteModal(favoriteSeq, kind, () => {
      console.log('openFavoriteModal callback');
    });
  };

  const handleDeleteFavoriteClick = (favoriteSeq: number) => {
    showDeleteDialog(() => {
      console.log(`삭제 처리 ${favoriteSeq}`);
    });
  };

  return (
    <>
      자주쓰는 거래
      <div style={{ height: '380px', overflow: 'auto' }}>
        <Table striped bordered hover style={{ fontSize: '0.9em' }} className="favorite">
          <tbody>
            {favoriteList.map((favorite, index) => (
              <tr key={favorite.favoriteSeq}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td>
                  <Button onClick={() => onSelectFavorite(favorite)} variant="link" style={{ padding: '0' }}>
                    {favorite.title}
                  </Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {index > 0 && (
                    <Button variant="link" onClick={() => {}}>
                      <FaArrowUp />
                    </Button>
                  )}
                  {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                  {index < favoriteList.length - 1 && (
                    <Button variant="link" onClick={() => {}}>
                      <FaArrowDown />
                    </Button>
                  )}
                  {index === favoriteList.length - 1 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button variant="link" onClick={() => handleEditFavoriteClick(favorite.favoriteSeq)}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={() => handleDeleteFavoriteClick(favorite.favoriteSeq)}>
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
