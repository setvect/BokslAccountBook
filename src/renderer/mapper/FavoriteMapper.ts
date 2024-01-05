/**
 * 계좌정보 맵핑
 */
import { ResFavoriteModel } from '../../common/ResModel';
import { IPC_CHANNEL, TransactionKind } from '../../common/CommonType';

let globalFavoriteList: ResFavoriteModel[] = [];

function loadFavoriteList(callBack: () => void = () => {}) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteLoad, (arg: any) => {
    globalFavoriteList = arg as ResFavoriteModel[];
    callBack();
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteLoad);
}

function getFavorite(favoriteSeq: number): ResFavoriteModel {
  const account = globalFavoriteList.find((account) => account.favoriteSeq === favoriteSeq);
  if (!account) {
    throw new Error(`자주쓰는 거래를 찾을수 없습니다. favoriteSeq: ${favoriteSeq}`);
  }
  return account;
}

function getFavoriteList(kind: TransactionKind) {
  return globalFavoriteList.filter((favorite) => favorite.kind === kind);
}

const FavoriteMapper = {
  loadList: loadFavoriteList,
  getFavorite,
  getList: getFavoriteList,
};

export default FavoriteMapper;
