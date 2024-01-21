import { Cell, CellProps } from 'react-table';
import { ResTradeModel } from '../../../../common/ResModel';
import { TradeKindProperties } from '../../../common/RendererModel';
import { TradeKind } from '../../../../common/CommonType';
import { convertToCommaSymbol, convertToPercentage } from '../../util/util';
import React, { CSSProperties } from 'react';
import StockMapper from '../../../mapper/StockMapper';

const renderType = ({ row }: CellProps<ResTradeModel>) => {
  const kindProperty = TradeKindProperties[row.original.kind];
  return <span className={kindProperty.color}>{kindProperty.label}</span>;
};

const renderReturnRate = (resTradeModel: ResTradeModel) => {
  if (resTradeModel.kind === TradeKind.BUY) {
    return '';
  }

  const sellAmount = resTradeModel.quantity * resTradeModel.price;
  const rate = resTradeModel.sellGains / (sellAmount - resTradeModel.sellGains);

  if (resTradeModel.sellGains > 0) {
    return <span className="account-buy">{convertToPercentage(rate)}</span>;
  }
  return <span className="account-sell">{convertToPercentage(rate)}</span>;
};

const renderSellProfit = (resTradeModel: ResTradeModel) => {
  if (resTradeModel.kind === TradeKind.BUY) {
    return '-';
  }

  const { currency } = StockMapper.getStock(resTradeModel.stockSeq);
  if (resTradeModel.sellGains > 0) {
    return <span className="account-buy">{convertToCommaSymbol(resTradeModel.sellGains, currency)}</span>;
  }
  return <span className="account-sell">{convertToCommaSymbol(resTradeModel.sellGains, currency)}</span>;
};

const renderCell = (cell: Cell<ResTradeModel>) => {
  const customStyles: CSSProperties = {};
  if (['quantity', 'price', 'total', 'tax', 'fee', 'sellGains', 'returnRate'].includes(cell.column.id)) {
    customStyles.textAlign = 'right';
  }

  if (['no', 'kind', 'actions'].includes(cell.column.id)) {
    customStyles.textAlign = 'center';
  }
  let className = '';
  if (['sellGains', 'returnRate'].includes(cell.column.id)) {
    if (cell.row.original.sellGains == null) {
      className = '';
    } else if (cell.row.original.sellGains > 0) {
      className = 'account-buy';
    } else {
      className = 'account-sell';
    }
  }
  return (
    <td {...cell.getCellProps()} style={customStyles} className={className}>
      {cell.render('Cell')}
    </td>
  );
};
const TradeCommon = {
  renderType,
  renderReturnRate,
  renderCell,
  renderSellProfit,
};

export default TradeCommon;
