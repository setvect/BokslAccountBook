import _ from 'lodash';
import { TransactionKind } from '../common/BokslTypes';

/**
 * 거래 분류 매핑을 위한 유틸리티
 */
export enum CategoryKind {
  INCOME = 'INCOME',
  SPENDING = 'SPENDING',
  TRANSFER = 'TRANSFER',
}

export type CategoryMapping = {
  categorySeq: number;
  kind: CategoryKind;
  name: string;
  parentSeq: number;
  orderNo: number;
};

let globalCodeMapping: CategoryMapping[];

function loadCategoryMapping() {
  globalCodeMapping = [
    { categorySeq: 34, kind: CategoryKind.INCOME, name: '근로소득', parentSeq: 0, orderNo: 0 },
    { categorySeq: 35, kind: CategoryKind.INCOME, name: '급여', parentSeq: 34, orderNo: 0 },
    { categorySeq: 36, kind: CategoryKind.INCOME, name: '상여금', parentSeq: 34, orderNo: 1 },
    { categorySeq: 37, kind: CategoryKind.INCOME, name: '수당', parentSeq: 34, orderNo: 2 },
    { categorySeq: 38, kind: CategoryKind.INCOME, name: '성과급', parentSeq: 34, orderNo: 3 },
    { categorySeq: 39, kind: CategoryKind.INCOME, name: '금융소득', parentSeq: 0, orderNo: 1 },
    { categorySeq: 40, kind: CategoryKind.INCOME, name: '이자소득', parentSeq: 39, orderNo: 0 },
    { categorySeq: 41, kind: CategoryKind.INCOME, name: '배당소득', parentSeq: 39, orderNo: 1 },

    { categorySeq: 50, kind: CategoryKind.TRANSFER, name: '대체거래', parentSeq: 0, orderNo: 0 },
    { categorySeq: 51, kind: CategoryKind.TRANSFER, name: '계좌이체', parentSeq: 50, orderNo: 0 },
    { categorySeq: 52, kind: CategoryKind.TRANSFER, name: '인출', parentSeq: 50, orderNo: 1 },
    { categorySeq: 53, kind: CategoryKind.TRANSFER, name: '입금', parentSeq: 50, orderNo: 2 },
    { categorySeq: 54, kind: CategoryKind.TRANSFER, name: '카드결재', parentSeq: 50, orderNo: 3 },

    { categorySeq: 59, kind: CategoryKind.SPENDING, name: '식료품비', parentSeq: 0, orderNo: 0 },
    { categorySeq: 60, kind: CategoryKind.SPENDING, name: '주식/부식', parentSeq: 59, orderNo: 0 },
    { categorySeq: 61, kind: CategoryKind.SPENDING, name: '외식', parentSeq: 59, orderNo: 1 },
    { categorySeq: 62, kind: CategoryKind.SPENDING, name: '간식', parentSeq: 59, orderNo: 2 },
    { categorySeq: 63, kind: CategoryKind.SPENDING, name: '아침대용', parentSeq: 59, orderNo: 3 },
    { categorySeq: 64, kind: CategoryKind.SPENDING, name: '주거비', parentSeq: 0, orderNo: 1 },
    { categorySeq: 65, kind: CategoryKind.SPENDING, name: '월세', parentSeq: 64, orderNo: 1 },
    { categorySeq: 66, kind: CategoryKind.SPENDING, name: '주택수리비', parentSeq: 64, orderNo: 1 },
  ];
}

function getCategoryName(categorySeq: number): string | undefined {
  const category = globalCodeMapping.find((code) => code.categorySeq === categorySeq);
  if (!category) {
    return undefined;
  }
  return category.name;
}

function getCategoryList(kind: CategoryKind, parentSeq: number = 0): CategoryMapping[] {
  const categoryMappings = globalCodeMapping
    .filter((code) => code.kind === kind && code.parentSeq === parentSeq)
    .sort((a, b) => a.orderNo - b.orderNo);
  return _.cloneDeep(categoryMappings);
}

function getTransactionKindMapping(transactionKind: TransactionKind): CategoryKind {
  switch (transactionKind) {
    case TransactionKind.INCOME:
      return CategoryKind.INCOME;
    case TransactionKind.SPENDING:
      return CategoryKind.SPENDING;
    case TransactionKind.TRANSFER:
      return CategoryKind.TRANSFER;
    default:
      throw new Error(`invalid transationKind: ${transactionKind}`);
  }
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

const CategoryMapper = {
  loadCategoryMapping,
  getCategoryName,
  getCategoryList,
  getTransactionKindMapping,
  getCategoryPathText,
};

export default CategoryMapper;
