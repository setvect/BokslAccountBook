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
