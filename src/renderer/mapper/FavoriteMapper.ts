/**
 * 계좌정보 맵핑
 */
import { ResFavoriteModel } from '../../common/ResModel';
import { TransactionKind } from '../../common/CommonType';
import { favorites } from '../state/referenceData';

const loadFavoriteList = favorites.load;

function getFavorite(favoriteSeq: number): ResFavoriteModel {
  const account = favorites.getSnapshot().find((account) => account.favoriteSeq === favoriteSeq);
  if (!account) {
    throw new Error(`자주쓰는 거래를 찾을수 없습니다. favoriteSeq: ${favoriteSeq}`);
  }
  return account;
}

function getFavoriteList(kind: TransactionKind) {
  return favorites.getSnapshot().filter((favorite) => favorite.kind === kind);
}

const FavoriteMapper = {
  loadList: loadFavoriteList,
  getFavorite,
  getList: getFavoriteList,
};

export default FavoriteMapper;
