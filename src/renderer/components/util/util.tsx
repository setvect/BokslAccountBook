import React from 'react';
import { FaCheckCircle, FaExternalLinkAlt, FaRegCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { CurrencyProperties } from '../../common/RendererModel';
import { Currency, CurrencyAmountModel } from '../../../common/CommonType';

export function convertToComma(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toLocaleString();
}

export function convertToCommaDecimal(value: number | null | undefined, decimalPlace: number = 2) {
  if (value === null || value === undefined) {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: decimalPlace,
    minimumFractionDigits: decimalPlace,
  }).format(value);
}

export function convertToCommaSymbol(value: number | null | undefined, currency: Currency) {
  return CurrencyProperties[currency].symbol + convertToCommaDecimal(value, CurrencyProperties[currency].decimalPlace);
}

/**
 * 소수점 2자리까지 표시
 * @param value 0.1 => 10.00%, 1 => 100.00%, 0.1234 => 12.34%
 */
export function convertToPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }
  return `${(value * 100).toFixed(2)}%`;
}

export function printMultiCurrency(value: CurrencyAmountModel[], color: boolean = false) {
  return (
    <div>
      {value
        .filter((balance) => balance.amount !== 0 || balance.currency === Currency.KRW)
        .map((balance) => {
          let classColor = '';
          if (color) {
            classColor = balance.amount > 0 ? 'account-buy' : 'account-sell';
          }

          return (
            <div key={balance.currency} className={classColor}>
              {convertToCommaSymbol(balance.amount, balance.currency)}
            </div>
          );
        })}
    </div>
  );
}

export function printEnable(value: boolean) {
  return value ? <FaCheckCircle color="yellow" /> : <FaRegCircle />;
}

export function printExternalLink(label: string, link: string) {
  if (!link) {
    return '';
  }
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {label}
      <FaExternalLinkAlt style={{ marginLeft: '5px' }} />
    </a>
  );
}

export function printColorAmount(value: number) {
  return <div className={value > 0 ? 'account-buy' : 'account-sell'}>{convertToComma(value)}</div>;
}

export function printColorPercentage(value: number) {
  return <div className={value > 0 ? 'account-buy' : 'account-sell'}>{convertToPercentage(value)}</div>;
}

export function downloadForString(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadForTable(tableRef: React.RefObject<HTMLTableElement>, filename: string): void {
  // @ts-ignore
  const html = tableRef.current.outerHTML.replaceAll('<table', "<table border='1'");
  downloadForString(html, filename);
}

export function convertToCurrencyEnum(value: string): Currency | undefined {
  if (value in Currency) {
    return Currency[value as keyof typeof Currency];
  }
  return undefined;
}

export function renderSortIndicator(column: any) {
  if (!column.isSorted) {
    return null;
  }

  return column.isSortedDesc ? ' 🔽' : ' 🔼';
}

export function showDeleteDialog(okProcess: () => void, message: string = '삭제할까요?') {
  Swal.fire({
    title: message,
    icon: 'warning',
    showCancelButton: true,
    showClass: {
      popup: '',
    },
    hideClass: {
      popup: '',
    },
  })
    .then((result) => {
      if (result.isConfirmed) {
        okProcess();
        return true;
      }
      return false;
    })
    .catch((error) => {
      showWarnDialog(`삭제 작업 중 오류가 발생했습니다.${error.toString()}`);
      console.error('삭제 작업 중 오류가 발생했습니다:', error);
    });
}

export function showInfoDialog(message: string) {
  Swal.fire({
    title: message,
    icon: 'info',
    showClass: {
      popup: '',
    },
    hideClass: {
      popup: '',
    },
  });
}

export function showWarnDialog(message: string) {
  Swal.fire({
    title: message,
    icon: 'warning',
    showClass: {
      popup: '',
    },
    hideClass: {
      popup: '',
    },
  });
}

/**
 * 수익률 계산 (현재가 - 매입가) / 매입가 * 100
 */
export function calcYield(totalAmount: number, evaluateAmount: number) {
  if (totalAmount === 0) {
    return 0;
  }

  return ((evaluateAmount - totalAmount) / totalAmount) * 100;
}

function getOperatingSystem() {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('mac')) {
    return 'Mac';
  }
  if (platform.includes('win')) {
    return 'Windows';
  }
  return 'Other';
}

export function isWindows() {
  return getOperatingSystem() === 'Windows';
}

export function isMac() {
  return getOperatingSystem() === 'Mac';
}

export function getCurrencyOptions() {
  return Object.entries(CurrencyProperties).map(([currency, { name, symbol }]) => ({
    value: currency,
    label: `${name} (${symbol})`,
  }));
}

export function toBr(text: string | null | undefined) {
  if (!text) {
    return '';
  }
  return text.split('\n').map((line, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <React.Fragment key={index}>
      {line}
      {index !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
}

export function getReConfirmKey(): string {
  if (isWindows()) {
    return 'Ctrl+Shift+Enter';
  }
  if (isMac()) {
    return 'Cmd+Shift+Enter';
  }
  return '';
}

export function getConfirmKey(): string {
  if (isWindows()) {
    return 'Ctrl+Enter';
  }
  if (isMac()) {
    return 'Cmd+Enter';
  }
  return '';
}

export function getCurrencyOptionList(withOutCurrency: Currency | null | undefined = null) {
  return Object.entries(CurrencyProperties)
    .filter(([currency]) => currency !== withOutCurrency)
    .map(([currency, { name, symbol }]) => ({
      value: currency,
      label: `${name} (${symbol})`,
    }));
}
