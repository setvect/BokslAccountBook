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
  // KIND_CODE,자산유형
  // ATTR_SPENDING,지출속성
  // ATTR_TRANSFER,이체속성
  // ATTR_INCOME,수입속성
  // TYPE_STOCK,주식종류
  // TYPE_ACCOUNT,계좌성격
  // TYPE_NATION,주식 상장국가

  globalCodeMapping = {
    ATTR_INCOME: {
      1: '단순 수입',
      2: '투자 수입',
    },
    ATTR_SPENDING: {
      1: '단순 지출',
      2: '고정 지출',
    },
    ATTR_TRANSFER: {
      1: '단순 이체',
      2: '투자 이체',
      3: '부채 이체',
    },
    KIND_CODE: {
      1: '신용카드',
      2: '체크카드',
      3: '은행통장',
    },
    TYPE_STOCK: {
      1: '개별종목',
      2: '지수 ETF',
      3: '리츠 ETF',
    },
    TYPE_ACCOUNT: {
      1: '고정자산',
      2: '저축자산',
      3: '투자자산',
    },
    TYPE_NATION: {
      1: '국내',
      2: '국내상장 외국 ETF',
      3: '미국',
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
