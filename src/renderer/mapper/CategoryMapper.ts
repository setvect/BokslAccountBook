import _ from 'lodash';

import { IPC_CHANNEL, TransactionKind } from '../../common/CommonType';
import { ResCategoryModel } from '../../common/ResModel';

let globalCodeMapping: ResCategoryModel[] = [];

function loadCategoryList(callBack: () => void = () => {}) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallCategoryLoad, (arg: any) => {
    globalCodeMapping = arg as ResCategoryModel[];
    callBack();
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCategoryLoad);
}

function getCategory(categorySeq: number) {
  const category = globalCodeMapping.find((code) => code.categorySeq === categorySeq);
  if (!category) {
    return undefined;
  }
  return category;
}

function getCategoryName(categorySeq: number) {
  const category = getCategory(categorySeq);
  return category ? category.name : '';
}

function getCategoryList(kind: TransactionKind, parentSeq: number = 0): ResCategoryModel[] {
  const categoryMappings = globalCodeMapping
    .filter((code) => code.kind === kind && code.parentSeq === parentSeq)
    .sort((a, b) => a.orderNo - b.orderNo);
  return _.cloneDeep(categoryMappings);
}

function getCategoryPathText(categorySeq: number): string {
  const category = globalCodeMapping.find((code) => code.categorySeq === categorySeq);
  if (!category) {
    return '';
  }
  const parentCategory = globalCodeMapping.find((code) => code.categorySeq === category.parentSeq);
  if (!parentCategory) {
    return category.name;
  }
  return `${parentCategory.name} > ${category.name}`;
}

function getCategorySubList(kind: TransactionKind): ResCategoryModel[] {
  const categoryMappings = globalCodeMapping
    .filter((code) => code.kind === kind)
    .filter((code) => code.parentSeq !== 0)
    .sort((a, b) => a.orderNo - b.orderNo);
  return _.cloneDeep(categoryMappings);
}

const CategoryMapper = {
  loadCategoryList,
  getCategory,
  getCategoryName,
  getCategorySubList,
  getCategoryList,
  getCategoryPathText,
};

export default CategoryMapper;
