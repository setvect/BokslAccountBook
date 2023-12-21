import React, { forwardRef, useImperativeHandle } from 'react';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import { FaExchangeAlt, FaStickyNote } from 'react-icons/fa';
import { AiOutlineDollar, AiOutlineMinusCircle, AiOutlineMinusSquare, AiOutlinePlusCircle, AiOutlinePlusSquare } from 'react-icons/ai';
import { AccountType } from '../../common/RendererTypes';

interface ContextMenuProps {
  onMenuItemClick: (action: AccountType) => void;
}
export interface ContextMenuHandle {
  open: (x: number, y: number) => void;
  close: () => void;
}

const ContextMenuComponent = forwardRef<ContextMenuHandle, ContextMenuProps>((props, ref) => {
  const [anchorPoint, setAnchorPoint] = React.useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = React.useState(false);

  useImperativeHandle(ref, () => ({
    open: (x: number, y: number) => {
      setAnchorPoint({ x, y });
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
  }));

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ControlledMenu theming="dark" anchorPoint={anchorPoint} state={isOpen ? 'open' : 'closed'} direction="right" onClose={handleClose}>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.EXPENSE)}>
        <AiOutlineMinusSquare className="account-spending" style={{ marginBottom: 1, marginRight: 10 }} /> 지출
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.INCOME)}>
        <AiOutlinePlusSquare className="account-income" style={{ marginBottom: 1, marginRight: 10 }} /> 수입
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.TRANSFER)}>
        <FaExchangeAlt className="account-transfer" style={{ marginBottom: 1, marginRight: 10 }} /> 이체
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.BUY)}>
        <AiOutlinePlusCircle className="account-buy" style={{ marginBottom: 1, marginRight: 10 }} /> 매수
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.SELL)}>
        <AiOutlineMinusCircle className="account-sell" style={{ marginBottom: 1, marginRight: 10 }} /> 매도
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.EXCHANGE_BUY)}>
        <AiOutlineDollar className="account-exchange" style={{ marginBottom: 1, marginRight: 10 }} /> 환전 - 원화 매수
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.EXCHANGE_SELL)}>
        <AiOutlineDollar className="account-exchange" style={{ marginBottom: 1, marginRight: 10 }} /> 환전 - 원화 매도
      </MenuItem>
      <MenuItem onClick={() => props.onMenuItemClick(AccountType.MEMO)}>
        <FaStickyNote className="account-memo" style={{ marginBottom: 1, marginRight: 10 }} /> 메모
      </MenuItem>
    </ControlledMenu>
  );
});

export default ContextMenuComponent;
