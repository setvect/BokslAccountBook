/**
 * 주식 종목 맵핑
 */

import { ResStockBuyModel } from '../../common/ResModel';
import { IPC_CHANNEL } from '../../common/CommonType';

let globalStockBuyList: ResStockBuyModel[] = [];

function loadStockBuyList(callBack: () => void = () => {}) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockBuyLoad, (arg: any) => {
    globalStockBuyList = arg as ResStockBuyModel[];
    if (callBack) {
      callBack();
    }
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyLoad);
}

function getStockBuy(stockBuySeq: number): ResStockBuyModel {
  const stockBuy = globalStockBuyList.find((stockBuy) => stockBuy.stockBuySeq === stockBuySeq);
  if (!stockBuy) {
    throw new Error(`매수 종목을 찾을 수 없습니다. stockSeq: ${stockBuySeq}`);
  }
  return stockBuy;
}

function getStockBuyList(): ResStockBuyModel[] {
  return globalStockBuyList;
}

function getStockBuyAccount(accountSeq: number, stockSeq: number): ResStockBuyModel | undefined {
  return globalStockBuyList.find((stockBuy) => stockBuy.accountSeq === accountSeq && stockBuy.stockSeq === stockSeq);
}

const StockBuyMapper = {
  loadBuyList: loadStockBuyList,
  getStockBuy,
  getAccount: getStockBuyAccount,
  getList: getStockBuyList,
};

export default StockBuyMapper;
