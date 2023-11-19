import { GroupBase, StylesConfig } from 'react-select';
import { OptionType } from './BokslTypes';

const darkThemeStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (styles, { isDisabled }) => ({
    ...styles,
    backgroundColor: isDisabled ? '#343a40' : '#212529',
    color: '#dee2e6',
    borderColor: isDisabled ? '#495057' : '#495057',
  }),
  singleValue: (styles) => ({
    ...styles,
    color: '#dee2e6',
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: '#212529',
    color: 'white',
  }),
  option: (styles, { isFocused, isSelected }) => {
    let backgroundColor = 'black';
    if (isFocused) {
      backgroundColor = '#33394a';
    } else if (isSelected) {
      backgroundColor = '#5d5e5f';
    }
    return {
      ...styles,
      backgroundColor,
      color: '#8e9092',
    };
  },
};

export default darkThemeStyles;
