import {
  ResAccountModel,
  ResCategoryModel,
  ResCodeModel,
  ResExchangeModel,
  ResFavoriteModel,
  ResSearchModel,
  ResStockBuyModel,
  ResStockModel,
  ResTradeModel,
  ResTransactionModel,
} from '../../common/ResModel';
import { IPC_CHANNEL } from '../../common/CommonType';
import { AccountForm, CategoryFrom, CodeFrom, ExchangeForm, FavoriteForm, StockBuyForm, StockForm, TradeForm } from '../../common/ReqModel';

// Category
function getCategoryList(): Promise<ResCategoryModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategoryLoad, (arg: any) => {
      resolve(arg as ResCategoryModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryLoad);
  });
}

function saveCategory(category: CategoryFrom): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategorySave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategorySave, category);
  });
}

function updateCategoryOrder(category: { orderNo: number; categorySeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategoryUpdateOrder, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryUpdateOrder, category);
  });
}

function updateCategory(category: CategoryFrom): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategoryUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryUpdate, category);
  });
}

function deleteCategory(categorySeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategoryDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryDelete, categorySeq);
  });
}

// Code
function getCodeList(): Promise<ResCodeModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeLoad, (arg: any) => {
      resolve(arg as ResCodeModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeLoad);
  });
}

function saveCode(code: CodeFrom): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeSave, code);
  });
}

function updateCode(code: CodeFrom): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeUpdate, code);
  });
}

function updateCodeOrder(code: { orderNo: number; codeItemSeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeUpdateOrder, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeUpdateOrder, code);
  });
}

function deleteCode(codeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeDelete, codeSeq);
  });
}

// Favorite
function getFavoriteList(): Promise<ResFavoriteModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteLoad, (arg: any) => {
      resolve(arg as ResFavoriteModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteLoad);
  });
}

function saveFavorite(favorite: FavoriteForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteSave, favorite);
  });
}

function updateFavorite(favorite: FavoriteForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteUpdate, favorite);
  });
}

function updateFavoriteOrder(category: { orderNo: number; favoriteSeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteUpdateOrder, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteUpdateOrder, category);
  });
}

function deleteFavorite(favoriteSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallFavoriteDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteDelete, favoriteSeq);
  });
}

// Account
function getAccountList(): Promise<ResAccountModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallAccountLoad, (arg: any) => {
      resolve(arg as ResAccountModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountLoad);
  });
}

function saveAccount(account: AccountForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallAccountSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountSave, account);
  });
}

function updateAccount(account: AccountForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallAccountUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountUpdate, account);
  });
}

function deleteAccount(accountSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallAccountDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountDelete, accountSeq);
  });
}

// Stock
function getStockList(): Promise<ResStockModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockLoad, (arg: any) => {
      resolve(arg as ResStockModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockLoad);
  });
}

function saveStock(stock: StockForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockSave, stock);
  });
}

function updateStock(stock: StockForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockUpdate, stock);
  });
}

function deleteStock(stockSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockDelete, stockSeq);
  });
}

// StockBuy
function getStockBuyList(): Promise<ResStockBuyModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockBuyLoad, (arg: any) => {
      resolve(arg as ResStockBuyModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyLoad);
  });
}

function saveStockBuy(stockBuy: StockBuyForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockBuySave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuySave, stockBuy);
  });
}

function updateStockBuy(stockBuy: StockBuyForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockBuyUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyUpdate, stockBuy);
  });
}

function deleteStockBuy(stockBuySeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallStockBuyDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyDelete, stockBuySeq);
  });
}

// Transaction
function getTransactionList(searchModel: ResSearchModel): Promise<ResTransactionModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTransactionList, (args: any) => {
      resolve(args as ResTransactionModel[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionList, searchModel);
  });
}

function getTransaction(transactionSeq: number): Promise<ResTransactionModel> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTransactionGet, (args: any) => {
      resolve(args as ResTransactionModel);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionGet, transactionSeq);
  });
}

function saveTransaction(transaction: ResTransactionModel): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTransactionSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionSave, transaction);
  });
}

function updateTransaction(transaction: ResTransactionModel): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTransactionUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionUpdate, transaction);
  });
}

function deleteTransaction(transactionSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTransactionDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionDelete, transactionSeq);
  });
}

// Trade
function getTradeList(searchModel: ResSearchModel): Promise<ResTradeModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTradeList, (args: any) => {
      resolve(args as ResTradeModel[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeList, searchModel);
  });
}
function getTrade(tradeSeq: number): Promise<ResTradeModel> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTradeGet, (args: any) => {
      resolve(args as ResTradeModel);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeGet, tradeSeq);
  });
}

function saveTrade(trade: TradeForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTradeSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeSave, trade);
  });
}

function updateTrade(trade: TradeForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTradeUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeUpdate, trade);
  });
}

function deleteTrade(tradeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallTradeDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeDelete, tradeSeq);
  });
}

// Exchange
function getExchangeList(searchModel: ResSearchModel): Promise<ResExchangeModel[]> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeList, (args: any) => {
      resolve(args as ResExchangeModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeList, searchModel);
  });
}

function getExchange(exchangeSeq: number): Promise<ResExchangeModel> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeGet, (args: any) => {
      resolve(args as ResExchangeModel);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeGet, exchangeSeq);
  });
}

function saveExchange(exchange: ExchangeForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeSave, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeSave, exchange);
  });
}

function updateExchange(exchange: ExchangeForm): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeUpdate, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeUpdate, exchange);
  });
}

function deleteExchange(exchangeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallExchangeDelete, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeDelete, exchangeSeq);
  });
}

function changeUserPassword(changePassword: [string, string]): Promise<void> {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallUserChangePassword, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallUserChangePassword, changePassword);
  });
}

function login(password: string) {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(IPC_CHANNEL.CallUserCheckPassword, (args: any) => {
      resolve(args as boolean);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallUserCheckPassword, password);
  });
}

const IpcCaller = {
  getCategoryList,
  saveCategory,
  updateCategory,
  updateCategoryOrder,
  deleteCategory,

  getCodeList,
  saveCode,
  updateCode,
  updateCodeOrder,
  deleteCode,

  getFavoriteList,
  saveFavorite,
  updateFavorite,
  updateFavoriteOrder,
  deleteFavorite,

  getAccountList,
  saveAccount,
  updateAccount,
  deleteAccount,

  getStockList,
  saveStock,
  updateStock,
  deleteStock,

  getStockBuyList,
  saveStockBuy,
  updateStockBuy,
  deleteStockBuy,

  getTransactionList,
  getTransaction,
  saveTransaction,
  updateTransaction,
  deleteTransaction,

  getTradeList,
  getTrade,
  saveTrade,
  updateTrade,
  deleteTrade,

  getExchangeList,
  getExchange,
  saveExchange,
  updateExchange,
  deleteExchange,

  changeUserPassword,
  login,
};

export default IpcCaller;
