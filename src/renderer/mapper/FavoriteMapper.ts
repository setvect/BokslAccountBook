/**
 * 계좌정보 맵핑
 */
import { ResFavoriteModel } from '../../common/ResModel';
import { Currency, TransactionKind } from '../../common/CommonType';

let globalFavoriteList: ResFavoriteModel[] = [];

function loadFavoriteList(callBack: () => void = () => {}) {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalFavoriteList = [
    {
      favoriteSeq: 1,
      title: '월급 > 100,000,000',
      categorySeq: 35,
      kind: TransactionKind.INCOME,
      note: '월급',
      currency: Currency.USD,
      amount: 100_000_000,
      payAccount: 0,
      receiveAccount: 2,
      attribute: 1,
      orderNo: 1,
    },
    {
      favoriteSeq: 2,
      title: '배당금',
      categorySeq: 39,
      kind: TransactionKind.INCOME,
      note: '배당금',
      currency: Currency.USD,
      amount: 1000,
      payAccount: 0,
      receiveAccount: 1,
      attribute: 1,
      orderNo: 2,
    },
    {
      favoriteSeq: 3,
      title: '떡볶이 사먹기',
      categorySeq: 62,
      kind: TransactionKind.SPENDING,
      note: '떡볶이',
      currency: Currency.KRW,
      amount: 2500,
      payAccount: 4,
      receiveAccount: 0,
      attribute: 1,
      orderNo: 3,
    },
    {
      favoriteSeq: 4,
      title: '점심',
      categorySeq: 60,
      kind: TransactionKind.SPENDING,
      note: '점심',
      currency: Currency.KRW,
      amount: 12_000,
      payAccount: 4,
      receiveAccount: 0,
      attribute: 1,
      orderNo: 4,
    },
    {
      favoriteSeq: 5,
      title: '카드값',
      categorySeq: 54,
      kind: TransactionKind.TRANSFER,
      note: '카드값',
      currency: Currency.KRW,
      amount: 0,
      payAccount: 2,
      receiveAccount: 4,
      attribute: 1,
      orderNo: 5,
    },
  ];
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
  loadFavoriteMapping: loadFavoriteList,
  getFavorite,
  getFavoriteList,
};

export default FavoriteMapper;
