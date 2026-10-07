import { useSyncExternalStore } from 'react';
import { IPC_CHANNEL } from '../../common/CommonType';
import { RequestChannel } from '../../common/ipc/Contract';
import request from '../common/request';
import createListStore from './createListStore';

let revision = 0;
const listeners = new Set<() => void>();
function changed() {
  revision += 1;
  listeners.forEach((listener) => listener());
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getRevision = () => revision;
export function useReferenceData() {
  return useSyncExternalStore(subscribe, getRevision, getRevision);
}

export const accounts = createListStore(() => request(IPC_CHANNEL.CallAccountLoad), changed);
export const categories = createListStore(() => request(IPC_CHANNEL.CallCategoryLoad), changed);
export const stocks = createListStore(() => request(IPC_CHANNEL.CallStockLoad), changed);
export const holdings = createListStore(() => request(IPC_CHANNEL.CallStockBuyLoad), changed);
export const codes = createListStore(() => request(IPC_CHANNEL.CallCodeLoad), changed);
export const favorites = createListStore(() => request(IPC_CHANNEL.CallFavoriteLoad), changed);

const refreshByMutation: Partial<Record<RequestChannel, (() => Promise<unknown>)[]>> = {
  [IPC_CHANNEL.CallAccountSave]: [accounts.load],
  [IPC_CHANNEL.CallAccountUpdate]: [accounts.load],
  [IPC_CHANNEL.CallAccountDelete]: [accounts.load],
  [IPC_CHANNEL.CallCategorySave]: [categories.load],
  [IPC_CHANNEL.CallCategoryUpdate]: [categories.load],
  [IPC_CHANNEL.CallCategoryUpdateOrder]: [categories.load],
  [IPC_CHANNEL.CallCategoryDelete]: [categories.load],
  [IPC_CHANNEL.CallStockSave]: [stocks.load],
  [IPC_CHANNEL.CallStockUpdate]: [stocks.load, accounts.load],
  [IPC_CHANNEL.CallStockDelete]: [stocks.load],
  [IPC_CHANNEL.CallStockBuySave]: [holdings.load, accounts.load],
  [IPC_CHANNEL.CallStockBuyUpdate]: [holdings.load, accounts.load],
  [IPC_CHANNEL.CallStockBuyDelete]: [holdings.load, accounts.load],
  [IPC_CHANNEL.CallTransactionSave]: [accounts.load],
  [IPC_CHANNEL.CallTransactionUpdate]: [accounts.load],
  [IPC_CHANNEL.CallTransactionDelete]: [accounts.load],
  [IPC_CHANNEL.CallTradeSave]: [accounts.load, holdings.load],
  [IPC_CHANNEL.CallTradeUpdate]: [accounts.load, holdings.load],
  [IPC_CHANNEL.CallTradeDelete]: [accounts.load, holdings.load],
  [IPC_CHANNEL.CallExchangeSave]: [accounts.load],
  [IPC_CHANNEL.CallExchangeUpdate]: [accounts.load],
  [IPC_CHANNEL.CallExchangeDelete]: [accounts.load],
  [IPC_CHANNEL.CallFavoriteSave]: [favorites.load],
  [IPC_CHANNEL.CallFavoriteUpdate]: [favorites.load],
  [IPC_CHANNEL.CallFavoriteUpdateOrder]: [favorites.load],
  [IPC_CHANNEL.CallFavoriteDelete]: [favorites.load],
  [IPC_CHANNEL.CallCodeSave]: [codes.load],
  [IPC_CHANNEL.CallCodeUpdate]: [codes.load],
  [IPC_CHANNEL.CallCodeUpdateOrder]: [codes.load],
  [IPC_CHANNEL.CallCodeDelete]: [codes.load],
};
export async function refreshAfterMutation(channel: RequestChannel) {
  await Promise.all((refreshByMutation[channel] ?? []).map((load) => load()));
}
export async function loadReferenceData() {
  await Promise.all([accounts.load(), categories.load(), stocks.load(), holdings.load(), codes.load(), favorites.load()]);
}
