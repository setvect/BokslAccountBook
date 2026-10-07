import _ from 'lodash';

import { TransactionKind } from '../../common/CommonType';
import { ResCategoryModel } from '../../common/ResModel';
import { categories } from '../state/referenceData';

const loadCategoryList = categories.load;

function getCategory(categorySeq: number) {
  const category = categories.getSnapshot().find((code) => code.categorySeq === categorySeq);
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
  const categoryMappings = categories
    .getSnapshot()
    .filter((code) => !code.deleteF)
    .filter((code) => code.kind === kind && code.parentSeq === parentSeq)
    .sort((a, b) => a.orderNo - b.orderNo);
  return _.cloneDeep(categoryMappings);
}

function getCategoryPathText(categorySeq: number): string {
  const category = categories.getSnapshot().find((code) => code.categorySeq === categorySeq);
  if (!category) {
    return '';
  }
  const parentCategory = categories.getSnapshot().find((code) => code.categorySeq === category.parentSeq);
  if (!parentCategory) {
    return category.name;
  }
  return `${parentCategory.name} > ${category.name}`;
}

function getCategorySubList(kind: TransactionKind): ResCategoryModel[] {
  const categoryMappings = categories
    .getSnapshot()
    .filter((code) => !code.deleteF)
    .filter((code) => code.kind === kind)
    .filter((code) => code.parentSeq !== 0)
    .sort((a, b) => a.orderNo - b.orderNo);
  return _.cloneDeep(categoryMappings);
}

const CategoryMapper = {
  loadList: loadCategoryList,
  getCategory,
  getName: getCategoryName,
  getSubList: getCategorySubList,
  getList: getCategoryList,
  getPathText: getCategoryPathText,
};

export default CategoryMapper;
