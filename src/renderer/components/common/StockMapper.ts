/**
 * 주식 종목 맵핑
 */
import { Currency, ResStockModel } from './BokslTypes';

let globalStockList: ResStockModel[] = [];

export function loadStockList() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalStockList = [
    {
      stockSeq: 1,
      name: '복슬전자',
      currency: Currency.KRW,
      stockTypeCode: 1,
      nationCode: 2,
      link: 'https://finance.naver.com/item/main.nhn?code=005930',
      note: '...',
      enableF: true,
    },
    {
      stockSeq: 2,
      name: '복슬증권',
      currency: Currency.USD,
      stockTypeCode: 1,
      nationCode: 2,
      link: 'https://finance.naver.com/item/main.nhn?code=005930',
      note: '...',
      enableF: true,
    },
  ];
}

export function getStock(stockSeq: number): ResStockModel {
  const stock = globalStockList.find((stock) => stock.stockSeq === stockSeq);
  if (!stock) {
    throw new Error(`주식종목을 찾을 수 없습니다. stockSeq: ${stockSeq}`);
  }
  return stock;
}

export function getStockName(accountSeq: number) {
  return getStock(accountSeq).name;
}

export function getStockList(): ResStockModel[] {
  return globalStockList;
}
