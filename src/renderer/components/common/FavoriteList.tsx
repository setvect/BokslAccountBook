import { Button, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import React, { useEffect, useRef, useState } from 'react';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import FavoriteModal, { FavoriteModalHandle } from './FavoriteModal';
import { isMac, isWindows, showDeleteDialog } from '../util/util';
import FavoriteMapper from '../../mapper/FavoriteMapper';
import { ResFavoriteModel } from '../../../common/ResModel';
import { IPC_CHANNEL, TransactionKind } from '../../../common/CommonType';

interface FavoriteListProps {
  onSelectFavorite: (favorite: ResFavoriteModel) => void;
  kind: TransactionKind;
}

function FavoriteList({ onSelectFavorite, kind }: FavoriteListProps) {
  const favoriteModalRef = useRef<FavoriteModalHandle>(null);

  const [favoriteList, setFavoriteList] = useState<ResFavoriteModel[]>(FavoriteMapper.getFavoriteList(kind));

  const handleOpenFavoriteClick = () => {
    favoriteModalRef.current?.openFavoriteModal(0);
  };

  const handleEditFavoriteClick = (favoriteSeq: number) => {
    favoriteModalRef.current?.openFavoriteModal(favoriteSeq);
  };

  const handleDeleteFavoriteClick = (favoriteSeq: number) => {
    showDeleteDialog(() => {
      window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteDelete, () => {
        reloadFavorite();
      });

      window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteDelete, favoriteSeq);
      return true;
    });
  };

  // 단축키 처리 로직을 수행하는 함수
  const handleShortcut = (key: string) => {
    console.log(`Shortcut ${key} activated!`);
    const idx = parseInt(key, 10) - 1;
    if (idx < 0 || idx >= favoriteList.length) {
      return;
    }
    onSelectFavorite(favoriteList[idx]);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
      handleShortcut(event.key);
    }
  };

  // number: 1 ~ 9
  const getShortcutKey = (number: number) => {
    if (number < 1 || number > 9) {
      return number.toString();
    }
    if (isWindows()) {
      return `Ctrl + ${number}`;
    }
    if (isMac()) {
      return `Cmd + ${number}`;
    }
    return '';
  };

  const updateOrderCode = (firstItem: ResFavoriteModel, secondItem: ResFavoriteModel) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteUpdateOrder, () => {
      reloadFavorite();
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteUpdateOrder, [
      { favoriteSeq: firstItem.favoriteSeq, orderNo: secondItem.orderNo },
      { favoriteSeq: secondItem.favoriteSeq, orderNo: firstItem.orderNo },
    ]);
  };

  const changeOrder = (favoriteSeq: number, direction: 'up' | 'down') => {
    if (!favoriteList) {
      return;
    }
    const index = favoriteList.findIndex((favorite) => favorite.favoriteSeq === favoriteSeq);
    if (index === -1) {
      return;
    }

    const swapIndex = direction === 'down' ? index + 1 : index - 1;
    if (swapIndex < 0 || swapIndex >= favoriteList.length) {
      // 범위를 벗어나는 경우
      return;
    }

    updateOrderCode(favoriteList[index], favoriteList[swapIndex]);
  };
  const handleDownClick = (categorySeq: number) => {
    changeOrder(categorySeq, 'down');
  };

  const handleUpClick = (categorySeq: number) => {
    changeOrder(categorySeq, 'up');
  };

  const reloadFavorite = () => {
    FavoriteMapper.loadFavoriteMapping(() => {
      setFavoriteList(FavoriteMapper.getFavoriteList(kind));
    });
  };

  useEffect(
    () => {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      자주쓰는 거래
      <div style={{ height: '380px', overflow: 'auto' }}>
        <Table striped bordered hover style={{ fontSize: '0.9em' }} className="favorite">
          <tbody>
            {favoriteList.map((favorite, index) => (
              <tr key={favorite.favoriteSeq}>
                <td style={{ textAlign: 'center', width: '70px' }}>{getShortcutKey(index + 1)}</td>
                <td>
                  <Button onClick={() => onSelectFavorite(favorite)} variant="link" style={{ padding: '0' }}>
                    {favorite.title}
                  </Button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {index > 0 && (
                    <Button
                      variant="link"
                      onClick={() => {
                        handleUpClick(favorite.favoriteSeq);
                      }}
                    >
                      <FaArrowUp />
                    </Button>
                  )}
                  {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                  {index < favoriteList.length - 1 && (
                    <Button
                      variant="link"
                      onClick={() => {
                        handleDownClick(favorite.favoriteSeq);
                      }}
                    >
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
      <FavoriteModal
        ref={favoriteModalRef}
        onSubmit={() => {
          reloadFavorite();
        }}
        kind={kind}
      />
    </>
  );
}

export default FavoriteList;
