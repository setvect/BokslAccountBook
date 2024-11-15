import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface YearChoiceProps {
  onChange: (year: number) => void;
  defaultYear?: number;
}

function YearSelect({ onChange, defaultYear }: YearChoiceProps) {
  const currentYear = new Date().getFullYear();
  const year = defaultYear || currentYear;
  const years = Array.from(new Array(currentYear - 2008 + 1), (_, index) => 2008 + index);
  const [selectedYear, setSelectedYear] = useState(year);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    if (!year) {
      return;
    }
    setSelectedYear(year);
    onChange(year);
  };

  return (
    <Form.Select value={selectedYear} style={{ width: '180px', display: 'inline' }} onChange={handleChange}>
      <option value={0}>-- 결산 년도 선택 --</option>
      {years.reverse().map((year) => (
        <option key={year} value={year}>
          {year}년
        </option>
      ))}
    </Form.Select>
  );
}

YearSelect.defaultProps = {
  defaultYear: new Date().getFullYear(),
};

export default YearSelect;
