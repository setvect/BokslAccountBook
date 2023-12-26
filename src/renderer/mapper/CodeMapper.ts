import _ from 'lodash';

import { CodeKind, IPC_CHANNEL, TransactionKind } from '../../common/CommonType';
import { ResCodeModel, ResCodeValueModel } from '../../common/ResModel';

let globalCodeMapping: ResCodeModel[];

function loadCodeMapping(callBack: () => void) {
  window.electron.ipcRenderer.once(IPC_CHANNEL.CallCodeLoad, (arg: any) => {
    globalCodeMapping = arg as ResCodeModel[];
    if (callBack) {
      callBack();
    }
  });

  window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.CallCodeLoad);
}

function getCodeValue(codeKind: CodeKind, codeSeq: number): string | undefined {
  const code = globalCodeMapping.find((code) => code.code === codeKind);
  if (!code) return undefined;
  return code.subCodeList.find((code) => code.codeSeq === codeSeq)?.name;
}

function getCodeSubList(mainCode: CodeKind): ResCodeValueModel[] {
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
