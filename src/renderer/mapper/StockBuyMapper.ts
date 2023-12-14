/**
 * 주식 종목 맵핑
 */
import { ResStockBuyModel } from '../common/BokslTypes';

let globalStockBuyList: ResStockBuyModel[] = [];

export function loadStockList() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalStockBuyList = [
    {
      stockBuySeq: 1,
      stockSeq: 1,
      accountSeq: 1,
      purchaseAmount: 100_000,
      quantity: 10,
    },
    {
      stockBuySeq: 2,
      stockSeq: 2,
      accountSeq: 2,
      purchaseAmount: 2_000.59,
      quantity: 20,
    },
  ];
}

export function getStockBuy(stockSeq: number): ResStockBuyModel {
  const stock = globalStockBuyList.find((stock) => stock.stockSeq === stockSeq);
  if (!stock) {
    throw new Error(`주식종목을 찾을 수 없습니다. stockSeq: ${stockSeq}`);
  }
  return stock;
}

export function getStockBuyList(): ResStockBuyModel[] {
  return globalStockBuyList;
}
