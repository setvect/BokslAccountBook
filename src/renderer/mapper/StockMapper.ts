/**
 * 주식 종목 맵핑
 */
import { ResStockModel } from '../../common/ResModel';
import { IPC_CHANNEL } from '../../common/CommonType';
import StockBuyMapper from './StockBuyMapper';
import { convertToCommaSymbol } from '../components/util/util';

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

function getStockOptionBalanceList(accountSeq: number) {
  return getStockList().map((stock) => {
    const stockBuy = StockBuyMapper.getStockBuyAccount(accountSeq, stock.stockSeq);
    let info;
    if (stockBuy) {
      const { currency } = stock;
      info = `${stockBuy.quantity}주, ${convertToCommaSymbol(stockBuy.buyAmount, currency)}원,
       평단가: ${convertToCommaSymbol(stockBuy.buyAmount / stockBuy.quantity, currency)}`;
    } else {
      info = '0주';
    }

    return {
      value: stock.stockSeq,
      label: `${stock.name} (${stock.currency}): ${info}`,
    };
  });
}

const StockMapper = {
  loadStockMapping: loadStockList,
  getStock,
  getStockList,
  getStockOptionList,
  getStockOptionWithBalanceList: getStockOptionBalanceList,
};

export default StockMapper;
