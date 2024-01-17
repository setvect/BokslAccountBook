/**
 * 주식 종목 맵핑
 */

import { ResStockBuyModel } from '../../common/ResModel';
import IpcCaller from '../common/IpcCaller';

let globalStockBuyList: ResStockBuyModel[] = [];

async function loadStockBuyList() {
  globalStockBuyList = await IpcCaller.getStockBuyList();
}

function getStockBuy(stockBuySeq: number) {
  const stockBuy = globalStockBuyList.find((stockBuy) => stockBuy.stockBuySeq === stockBuySeq);
  if (!stockBuy) {
    throw new Error(`매수 종목을 찾을 수 없습니다. stockSeq: ${stockBuySeq}`);
  }
  return stockBuy;
}

function getStockBuyList() {
  return globalStockBuyList.filter((stockBuy) => !stockBuy.deleteF);
}

function getStockBuyAccount(accountSeq: number, stockSeq: number) {
  return globalStockBuyList.find((stockBuy) => stockBuy.accountSeq === accountSeq && stockBuy.stockSeq === stockSeq);
}

const StockBuyMapper = {
  loadList: loadStockBuyList,
  getStockBuy,
  getAccount: getStockBuyAccount,
  getList: getStockBuyList,
};

export default StockBuyMapper;
