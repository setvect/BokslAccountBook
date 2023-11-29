import React, { ChangeEventHandler, useState } from 'react';
import { Form } from 'react-bootstrap';

interface YearChoiceProps {
  onChange: (year: number) => void;
}

function YearSelect({ onChange }: YearChoiceProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 2008 + 1), (_, index) => 2008 + index);
  const [selectedYear, setSelectedYear] = useState(currentYear); // 현재 년도를 기본값으로 설정

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    onChange(year);
  };

  return (
    <Form.Select value={selectedYear} style={{ width: '180px' }} onChange={handleChange}>
      <option>-- 결산 년도 선택 --</option>
      {years.reverse().map((year) => (
        <option key={year} value={year}>
          {year}년
        </option>
      ))}
    </Form.Select>
  );
}

export default YearSelect;
