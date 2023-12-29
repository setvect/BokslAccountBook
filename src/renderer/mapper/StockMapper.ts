/**
 * 주식 종목 맵핑
 */
import { ResStockModel } from '../../common/ResModel';
import { IPC_CHANNEL } from '../../common/CommonType';

let globalStockList: ResStockModel[] = [];

function loadStockList(callBack: () => void = () => {}) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockLoad, (arg: any) => {
    globalStockList = arg as ResStockModel[];
    if (callBack) {
      callBack();
    }
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockLoad);
}

function getStock(stockSeq: number): ResStockModel {
  const stock = globalStockList.find((stock) => stock.stockSeq === stockSeq);
  if (!stock) {
    throw new Error(`주식종목을 찾을 수 없습니다. stockSeq: ${stockSeq}`);
  }
  return stock;
}

function getStockList(): ResStockModel[] {
  return globalStockList;
}

function getStockOptionList() {
  return getStockList().map((stock) => ({
    value: stock.stockSeq,
    label: `${stock.name} (${stock.currency})`,
  }));
}

const StockMapper = {
  loadStockMapping: loadStockList,
  getStock,
  getStockList,
  getStockOptionList,
};

export default StockMapper;
