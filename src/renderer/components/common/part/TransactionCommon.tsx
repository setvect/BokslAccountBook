import { Cell, CellProps } from 'react-table';
import React, { CSSProperties } from 'react';
import { ResTransactionModel } from '../../../../common/ResModel';
import { TransactionKindProperties } from '../../../common/RendererModel';

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

  if (['kind', 'transactionDate', 'actions'].includes(cell.column.id)) {
    customStyles.whiteSpace = 'nowrap';
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
