/**
 * 주식 종목 맵핑
 */

import { ResStockBuyModel } from '../../common/ResModel';

let globalStockBuyList: ResStockBuyModel[] = [];

function loadStockBuyList() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalStockBuyList = [
    // {
    //   stockBuySeq: 1,
    //   stockSeq: 1,
    //   accountSeq: 1,
    //   buyAmount: 100_000,
    //   quantity: 10,
    // },
    // {
    //   stockBuySeq: 2,
    //   stockSeq: 2,
    //   accountSeq: 2,
    //   buyAmount: 2_000.59,
    //   quantity: 20,
    // },
  ];
}

function getStockBuy(stockSeq: number): ResStockBuyModel {
  const stock = globalStockBuyList.find((stock) => stock.stockSeq === stockSeq);
  if (!stock) {
    throw new Error(`매수 종목을 찾을 수 없습니다. stockSeq: ${stockSeq}`);
  }
  return stock;
}

function getStockBuyList(): ResStockBuyModel[] {
  return globalStockBuyList;
}

const StockBuyMapper = {
  loadStockBuyMapping: loadStockBuyList,
  getStockBuy,
  getStockBuyList,
};

export default StockBuyMapper;
