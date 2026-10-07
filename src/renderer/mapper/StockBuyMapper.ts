/**
 * 주식 종목 맵핑
 */

import { holdings } from '../state/referenceData';

const loadStockBuyList = holdings.load;

function getStockBuy(stockBuySeq: number) {
  const stockBuy = holdings.getSnapshot().find((stockBuy) => stockBuy.stockBuySeq === stockBuySeq);
  if (!stockBuy) {
    throw new Error(`매수 종목을 찾을 수 없습니다. stockSeq: ${stockBuySeq}`);
  }
  return stockBuy;
}

function getStockBuyList() {
  return holdings.getSnapshot().filter((stockBuy) => !stockBuy.deleteF);
}

function getStockBuyAccount(accountSeq: number, stockSeq: number) {
  return holdings.getSnapshot().find((stockBuy) => stockBuy.accountSeq === accountSeq && stockBuy.stockSeq === stockSeq);
}

const StockBuyMapper = {
  loadList: loadStockBuyList,
  getStockBuy,
  getAccount: getStockBuyAccount,
  getList: getStockBuyList,
};

export default StockBuyMapper;
