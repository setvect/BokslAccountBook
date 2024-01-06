import { CodeKind, TransactionKind } from '../../common/CommonType';
import { ResCodeModel, ResCodeValueModel } from '../../common/ResModel';
import IpcCaller from '../common/IpcCaller';

let globalCodeMapping: ResCodeModel[];

async function loadCodeList() {
  globalCodeMapping = await IpcCaller.getCodeList();
}

function getCodeValue(codeKind: CodeKind, codeSeq: number): string | undefined {
  const code = globalCodeMapping.find((code) => code.code === codeKind);
  if (!code) {
    return undefined;
  }
  return code.subCodeList.find((code) => code.codeSeq === codeSeq)?.name;
}

function getCodeSubList(mainCode: CodeKind): ResCodeValueModel[] {
  const code = globalCodeMapping.find((code) => code.code === mainCode);
  if (!code) {
    return [];
  }
  return code.subCodeList.filter((code) => !code.deleteF);
}

function getCodeList() {
  return globalCodeMapping
    .filter((code) => !code.deleteF)
    .map((code) => {
      return {
        code: code.code,
        name: code.name,
        subCodeList: code.subCodeList.filter((subCode) => !subCode.deleteF),
      };
    });
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
  loadList: loadCodeList,
  getValue: getCodeValue,
  getSubList: getCodeSubList,
  getList: getCodeList,
  getTransactionKindToCodeMapping,
  getSubOptionList: getCodeSubOptionList,
};

export default CodeMapper;
