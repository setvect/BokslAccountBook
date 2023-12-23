import _ from 'lodash';

import { TransactionKind } from '../../common/CommonType';

/**
 * 코드 매핑을 위한 유틸리티
 */
export enum CodeKind {
  ASSET_TYPE = 'ASSET_TYPE',
  SPENDING_ATTR = 'SPENDING_ATTR',
  TRANSFER_ATTR = 'TRANSFER_ATTR',
  INCOME_ATTR = 'INCOME_ATTR',
  STOCK_TYPE = 'STOCK_TYPE',
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  NATION_TYPE = 'NATION_TYPE',
}

export type CodeValueModel = {
  codeSeq: number;
  name: string;
};

export type CodeMapping = {
  code: CodeKind;
  name: string;
  subCodeList: CodeValueModel[];
};

let globalCodeMapping: CodeMapping[];

function loadCodeMapping() {
  globalCodeMapping = [
    {
      code: CodeKind.ASSET_TYPE,
      name: '자산유형',
      subCodeList: [
        {
          codeSeq: 1,
          name: '신용카드',
        },
        {
          codeSeq: 2,
          name: '체크카드',
        },
        {
          codeSeq: 3,
          name: '은행통장',
        },
        {
          codeSeq: 4,
          name: '현금',
        },
      ],
    },
    {
      code: CodeKind.SPENDING_ATTR,
      name: '지출속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 지출',
        },
        {
          codeSeq: 2,
          name: '고정 지출',
        },
      ],
    },
    {
      code: CodeKind.TRANSFER_ATTR,
      name: '이체속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 이체',
        },
        {
          codeSeq: 2,
          name: '투자 이체',
        },
        {
          codeSeq: 3,
          name: '부채 이체',
        },
      ],
    },
    {
      code: CodeKind.INCOME_ATTR,
      name: '수입속성',
      subCodeList: [
        {
          codeSeq: 1,
          name: '단순 수입',
        },
        {
          codeSeq: 2,
          name: '투자 수입',
        },
        {
          codeSeq: 3,
          name: '노동소득',
        },
      ],
    },
    {
      code: CodeKind.STOCK_TYPE,
      name: '주식종류',
      subCodeList: [
        {
          codeSeq: 1,
          name: '개별종목',
        },
        {
          codeSeq: 2,
          name: '지수 ETF',
        },
        {
          codeSeq: 3,
          name: '리츠 ETF',
        },
      ],
    },
    {
      code: CodeKind.ACCOUNT_TYPE,
      name: '계좌성격',
      subCodeList: [
        {
          codeSeq: 1,
          name: '고정자산',
        },
        {
          codeSeq: 2,
          name: '저축자산',
        },
        {
          codeSeq: 3,
          name: '투자자산',
        },
        {
          codeSeq: 4,
          name: '부채자산',
        },
      ],
    },
    {
      code: CodeKind.NATION_TYPE,
      name: '주식 상장국가',
      subCodeList: [
        {
          codeSeq: 1,
          name: '국내',
        },
        {
          codeSeq: 2,
          name: '국내상장 외국 ETF',
        },
        {
          codeSeq: 3,
          name: '미국',
        },
      ],
    },
  ];
}

function getCodeValue(codeKind: CodeKind, codeSeq: number): string | undefined {
  const code = globalCodeMapping.find((code) => code.code === codeKind);
  if (!code) return undefined;
  return code.subCodeList.find((code) => code.codeSeq === codeSeq)?.name;
}

function getCodeSubList(mainCode: CodeKind): CodeValueModel[] {
  const code = globalCodeMapping.find((code) => code.code === mainCode);
  if (!code) {
    return [];
  }
  return _.cloneDeep(code.subCodeList);
}

function getCodeList() {
  return _.cloneDeep(globalCodeMapping);
}
function getTransactionKindToCodeMapping(transactionKind: TransactionKind): CodeKind {
  switch (transactionKind) {
    case TransactionKind.INCOME:
      return CodeKind.INCOME_ATTR;
    case TransactionKind.SPENDING:
      return CodeKind.SPENDING_ATTR;
    case TransactionKind.TRANSFER:
      return CodeKind.TRANSFER_ATTR;
    default:
      throw new Error(`invalid transationKind: ${transactionKind}`);
  }
}

function getCodeSubOptionList(mainCode: CodeKind) {
  return getCodeSubList(mainCode).map((code) => {
    return {
      value: code.codeSeq,
      label: code.name,
    };
  });
}

const CodeMapper = {
  loadCodeMapping,
  getCodeValue,
  getCodeSubList,
  getCodeList,
  getTransactionKindToCodeMapping,
  getCodeSubOptionList,
};

export default CodeMapper;
