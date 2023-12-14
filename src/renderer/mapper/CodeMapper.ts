/**
 * 코드 매핑을 위한 유틸리티
 */

type CodeMapping = {
  [mainCode: string]: {
    [subCode: number]: string;
  };
};

type CodeValueModel = {
  value: number;
  label: string;
};

let globalCodeMapping: CodeMapping = {};

export function loadCodeMapping() {
  // TODO 서버에서 코드 매핑 정보를 가져온다.
  globalCodeMapping = {
    KIND_CODE: {
      1: 'KIND_CODE_1',
      2: 'KIND_CODE_2',
    },
    ATTR_SPENDING: {
      1: 'ATTR_SPENDING_1',
      2: 'ATTR_SPENDING_2',
    },
    ATTR_TRANSFER: {
      1: 'ATTR_TRANSFER_1',
      2: 'ATTR_TRANSFER_2',
    },
    ATTR_INCOME: {
      1: 'ATTR_INCOME_1',
      2: 'ATTR_INCOME_2',
    },
    TYPE_STOCK: {
      1: 'TYPE_STOCK_1',
      2: 'TYPE_STOCK_2',
    },
    TYPE_ACCOUNT: {
      1: 'TYPE_ACCOUNT_1',
      2: 'TYPE_ACCOUNT_2',
    },
    TYPE_NATION: {
      1: 'TYPE_NATION_1',
      2: 'TYPE_NATION_2',
    },
  };
}

export function getCodeValue(mainCode: string, subCode: number): string | undefined {
  return globalCodeMapping[mainCode]?.[subCode];
}

export function getCodeList(key: string): CodeValueModel[] {
  const options = globalCodeMapping[key];
  if (!options) return [];

  return Object.entries(options).map(([value, label]) => ({
    value: Number(value),
    label,
  }));
}
