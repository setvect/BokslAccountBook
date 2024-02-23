import DatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import React from 'react';

registerLocale('ko', ko);

interface MyDatePickerProps extends ReactDatePickerProps {
  selected: Date | null | undefined;
  onChange: (date: Date) => void;
}

function MyDatePicker(props: MyDatePickerProps) {
  return <DatePicker {...props} dateFormat="yyyy-MM-dd" showMonthDropdown showYearDropdown locale="ko" />;
}

export default MyDatePicker;
