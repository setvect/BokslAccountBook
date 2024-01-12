import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { convertToCurrencyEnum } from '../util/util';
import { Currency } from '../../../common/CommonType';

interface CurrencyChoiceProps {
  onChange: (currency: Currency) => void;
}

function CurrencySelect({ onChange }: CurrencyChoiceProps) {
  const currentCurrency = Currency.KRW;
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = convertToCurrencyEnum(event.target.value);
    if (!currency) {
      return;
    }
    setSelectedCurrency(currency);
    onChange(currency);
  };

  return (
    <Form.Select value={selectedCurrency} style={{ width: '180px', display: 'inline' }} onChange={handleChange}>
      <option value={0}>-- 거래 통화 선택 --</option>
      {Object.values(Currency).map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </Form.Select>
  );
}

export default CurrencySelect;
