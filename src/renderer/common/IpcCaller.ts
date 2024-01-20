import {
  ResAccountModel,
  ResAssetTrend,
  ResCategoryModel,
  ResCodeModel,
  ResExchangeModel,
  ResFavoriteModel,
  ResMemoModal,
  ResPageModel,
  ResSnapshotModel,
  ResStockBuyModel,
  ResStockModel,
  ResTradeModel,
  ResTradeSum,
  ResTransactionModel,
  ResTransactionSum,
  ResTransactionSummary,
} from '../../common/ResModel';
import { ExchangeRateModel, IPC_CHANNEL } from '../../common/CommonType';
import {
  AccountForm,
  CategoryFrom,
  CodeFrom,
  ExchangeForm,
  FavoriteForm,
  MemoForm,
  ReqAssetTrend,
  ReqMonthlyAmountSumModel,
  ReqMonthlySummaryModel,
  ReqSearchModel,
  SnapshotForm,
  StockBuyForm,
  StockForm,
  TradeForm,
} from '../../common/ReqModel';
import { generateUUID } from '../../common/CommonUtil';

// Category
function getCategoryList(): Promise<ResCategoryModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResCategoryModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryLoad, uuid);
  });
}

function saveCategory(category: CategoryFrom): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategorySave, uuid, category);
  });
}

function updateCategoryOrder(category: { orderNo: number; categorySeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryUpdateOrder, uuid, category);
  });
}

function updateCategory(category: CategoryFrom): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryUpdate, uuid, category);
  });
}

function deleteCategory(categorySeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryDelete, uuid, categorySeq);
  });
}

// Code
function getCodeList(): Promise<ResCodeModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResCodeModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeLoad, uuid);
  });
}

function saveCode(code: CodeFrom): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeSave, uuid, code);
  });
}

function updateCode(code: CodeFrom): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeUpdate, uuid, code);
  });
}

function updateCodeOrder(code: { orderNo: number; codeItemSeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeUpdateOrder, uuid, code);
  });
}

function deleteCode(codeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeDelete, uuid, codeSeq);
  });
}

// Favorite
function getFavoriteList(): Promise<ResFavoriteModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResFavoriteModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteLoad, uuid);
  });
}

function saveFavorite(favorite: FavoriteForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteSave, uuid, favorite);
  });
}

function updateFavorite(favorite: FavoriteForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteUpdate, uuid, favorite);
  });
}

function updateFavoriteOrder(category: { orderNo: number; favoriteSeq: number }[]): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteUpdateOrder, uuid, category);
  });
}

function deleteFavorite(favoriteSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallFavoriteDelete, uuid, favoriteSeq);
  });
}

// Account
function getAccountList(): Promise<ResAccountModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResAccountModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountLoad, uuid);
  });
}

function saveAccount(account: AccountForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountSave, uuid, account);
  });
}

function updateAccount(account: AccountForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountUpdate, uuid, account);
  });
}

function deleteAccount(accountSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAccountDelete, uuid, accountSeq);
  });
}

// Stock
function getStockList(): Promise<ResStockModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResStockModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockLoad, uuid);
  });
}

function saveStock(stock: StockForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockSave, uuid, stock);
  });
}

function updateStock(stock: StockForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockUpdate, uuid, stock);
  });
}

function deleteStock(stockSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockDelete, uuid, stockSeq);
  });
}

// StockBuy
function getStockBuyList(): Promise<ResStockBuyModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (arg: any) => {
      resolve(arg as ResStockBuyModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyLoad, uuid);
  });
}

function saveStockBuy(stockBuy: StockBuyForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuySave, uuid, stockBuy);
  });
}

function updateStockBuy(stockBuy: StockBuyForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyUpdate, uuid, stockBuy);
  });
}

function deleteStockBuy(stockBuySeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStockBuyDelete, uuid, stockBuySeq);
  });
}

// Transaction
function getTransactionList(searchModel: ReqSearchModel): Promise<ResTransactionModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTransactionModel[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionList, uuid, searchModel);
  });
}

function getTransaction(transactionSeq: number): Promise<ResTransactionModel> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTransactionModel);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionGet, uuid, transactionSeq);
  });
}

function getTransactionMonthlyFinancialSummary(searchModel: ReqMonthlySummaryModel): Promise<ResTransactionSummary[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTransactionSummary[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionMonthlyFinancialSummary, uuid, searchModel);
  });
}

function getTransactionMonthlyAmountSum(searchModel: ReqMonthlyAmountSumModel): Promise<ResTransactionSum[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTransactionSum[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionMonthlyAmountSum, uuid, searchModel);
  });
}

function saveTransaction(transaction: ResTransactionModel): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionSave, uuid, transaction);
  });
}

function updateTransaction(transaction: ResTransactionModel): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionUpdate, uuid, transaction);
  });
}

function deleteTransaction(transactionSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTransactionDelete, uuid, transactionSeq);
  });
}

// Trade
function getTradeList(searchModel: ReqSearchModel): Promise<ResTradeModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTradeModel[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeList, uuid, searchModel);
  });
}

function getTradeMonthlyAmountSum(searchModel: ReqMonthlyAmountSumModel): Promise<ResTradeSum[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTradeSum[]);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeMonthlyAmountSum, uuid, searchModel);
  });
}

function getTrade(tradeSeq: number): Promise<ResTradeModel> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResTradeModel);
    });

    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeGet, uuid, tradeSeq);
  });
}

function saveTrade(trade: TradeForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeSave, uuid, trade);
  });
}

function updateTrade(trade: TradeForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeUpdate, uuid, trade);
  });
}

function deleteTrade(tradeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallTradeDelete, uuid, tradeSeq);
  });
}

// Exchange
function getExchangeList(searchModel: ReqSearchModel): Promise<ResExchangeModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResExchangeModel[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeList, uuid, searchModel);
  });
}

function getExchange(exchangeSeq: number): Promise<ResExchangeModel> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResExchangeModel);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeGet, uuid, exchangeSeq);
  });
}

function saveExchange(exchange: ExchangeForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeSave, uuid, exchange);
  });
}

function updateExchange(exchange: ExchangeForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeUpdate, uuid, exchange);
  });
}

function deleteExchange(exchangeSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallExchangeDelete, uuid, exchangeSeq);
  });
}

// Memo

function getMemoList(searchModel: ReqSearchModel): Promise<ResMemoModal[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResMemoModal[]);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoList, uuid, searchModel);
  });
}

function getMemo(memoSeq: number): Promise<ResMemoModal> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as ResMemoModal);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoGet, uuid, memoSeq);
  });
}

function getMemoSeqForDate(date: Date): Promise<number> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as number);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoSeqGetDate, uuid, date);
  });
}

function saveMemo(memo: MemoForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoSave, uuid, memo);
  });
}

function updateMemo(memo: MemoForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoUpdate, uuid, memo);
  });
}

function deleteMemo(memoSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallMemoDelete, uuid, memoSeq);
  });
}

// Statistic
function getAssetTrend(condition: ReqAssetTrend): Promise<ResAssetTrend[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => resolve(args as ResAssetTrend[]));
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallAssetTrend, uuid, condition);
  });
}

function getExchangeRate(): Promise<ExchangeRateModel[]> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => resolve(args as ExchangeRateModel[]));
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStoreExchangeRateGet, uuid);
  });
}

function saveExchangeRate(currencyRate: ExchangeRateModel[]): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallStoreExchangeRateSave, uuid, currencyRate);
  });
}

// Snapshot

/**
 * @param page 1 부터 시작
 */
function getSnapshotPage(page: number): Promise<ResPageModel<ResSnapshotModel>> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => resolve(args as ResPageModel<ResSnapshotModel>));
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallSnapshotPage, uuid, page);
  });
}

function getSnapshot(snapshotSeq: number): Promise<ResSnapshotModel> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => resolve(args as ResSnapshotModel));
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallSnapshotGet, uuid, snapshotSeq);
  });
}

function saveSnapshot(snapshot: SnapshotForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallSnapshotSave, uuid, snapshot);
  });
}

function updateSnapshot(snapshot: SnapshotForm): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallSnapshotUpdate, uuid, snapshot);
  });
}

function deleteSnapshot(snapshotSeq: number): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => resolve());
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallSnapshotDelete, uuid, snapshotSeq);
  });
}

function changeUserPassword(changePassword: [string, string]): Promise<void> {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, () => {
      resolve();
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallUserChangePassword, uuid, changePassword);
  });
}

function login(password: string) {
  return new Promise((resolve) => {
    const uuid = generateUUID();
    window.electron.ipcRenderer.once(uuid, (args: unknown) => {
      resolve(args as boolean);
    });
    window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallUserCheckPassword, uuid, password);
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
  getTransactionMonthlyFinancialSummary,
  getTransactionMonthlyAmountSum,
  getTransaction,
  saveTransaction,
  updateTransaction,
  deleteTransaction,

  getTradeList,
  getTradeMonthlyAmountSum,
  getTrade,
  saveTrade,
  updateTrade,
  deleteTrade,

  getExchangeList,
  getExchange,
  saveExchange,
  updateExchange,
  deleteExchange,

  getMemoList,
  getMemo,
  getMemoSeqForDate,
  saveMemo,
  updateMemo,
  deleteMemo,

  getSnapshotPage,
  getSnapshot,
  saveSnapshot,
  updateSnapshot,
  deleteSnapshot,

  getAssetTrend,

  getExchangeRate,
  saveExchangeRate,

  changeUserPassword,
  login,
};

export default IpcCaller;
