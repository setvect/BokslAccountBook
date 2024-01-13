import { Cell, CellProps } from 'react-table';
import { ResTradeModel, ResTransactionModel } from '../../../../common/ResModel';
import { TradeKindProperties, TransactionKindProperties } from '../../../common/RendererModel';
import { TradeKind } from '../../../../common/CommonType';
import { convertToPercentage } from '../../util/util';
import React, { CSSProperties } from 'react';

const renderType = ({ row }: CellProps<ResTransactionModel>) => {
  const kindProperty = TransactionKindProperties[row.original.kind];
  return <span className={kindProperty.color}>{kindProperty.label}</span>;
};

const renderCell = (cell: Cell<ResTransactionModel>) => {
  const customStyles: CSSProperties = {};
  if (['amount', 'fee'].includes(cell.column.id)) {
    customStyles.textAlign = 'right';
  }

  if (['no', 'kind', 'actions'].includes(cell.column.id)) {
    customStyles.textAlign = 'center';
  }
  return (
    <td {...cell.getCellProps()} style={customStyles}>
      {cell.render('Cell')}
    </td>
  );
};

const TransactionCommon = {
  renderType,
  renderCell,
};

export default TransactionCommon;
