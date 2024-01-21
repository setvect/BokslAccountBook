import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/prefer-default-export
export const generateUUID = () => {
  return uuidv4();
};

/**
 * 수익률 계산 (현재가 - 매입가) / 매입가
 */
export const calcYield = (totalAmount: number, evaluateAmount: number) => {
  if (totalAmount === 0) {
    return 0;
  }

  return (evaluateAmount - totalAmount) / totalAmount;
};
