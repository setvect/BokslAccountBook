import React, { ChangeEvent, forwardRef, KeyboardEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import CategoryMapper from '../../mapper/CategoryMapper';
import { TransactionKind } from '../../../common/CommonType';

interface AutoCompleteExampleProps {
  value: string;
  kind: TransactionKind;
  onChange: (newValue: string) => void;
  onCategorySelect: (categorySeq: number) => void;
}

type Suggestion = {
  value: number;
  label: string;
};

const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteExampleProps>(({ value, kind, onChange, onCategorySelect }, ref) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isUserInput, setIsUserInput] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async (inputValue: string) => {
      // TODO: API 호출
      const categoryList = CategoryMapper.getSubList(kind).filter((category) => category.name.includes(inputValue));
      return Promise.resolve(
        categoryList.map((category) => {
          return {
            value: category.categorySeq,
            label: CategoryMapper.getPathText(category.categorySeq),
          };
        }),
      );
    };

    const loadData = async () => {
      if (!isUserInput) {
        return;
      }
      if (!inputValue) {
        setSuggestions([]);
        return;
      }

      try {
        const fetchedData = await fetchData(inputValue);
        setSuggestions(fetchedData);
        setIsDropdownVisible(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    loadData();
  }, [inputValue, isUserInput, kind]);

  useEffect(() => {
    if (inputValue && isUserInput) {
      setIsDropdownVisible(true);
      setSelectedIndex(-1);
    } else {
      setIsDropdownVisible(false);
    }
  }, [inputValue, isUserInput]);

  useEffect(() => {
    console.log('호출....');
    setInputValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsUserInput(true);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    // TODO 분류 선택 이벤트 적용
    onCategorySelect(suggestion.value);
    setIsUserInput(false);
    setIsDropdownVisible(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && selectedIndex < suggestions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      selectSuggestion(suggestions[selectedIndex]);
    }
  };

  const handleOnBlur = () => {
    setIsDropdownVisible(false);
  };

  return (
    <div>
      <Form.Control
        type="text"
        className="autoCompleteInput"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => handleOnBlur()}
        maxLength={30}
        ref={ref}
      />
      <div className="autoCompleteContainer">
        {isDropdownVisible && (
          <ul className="suggestionList">
            {suggestions.map((item, index) => (
              <li key={item.value} className={`suggestionItem ${index === selectedIndex ? 'selectedItem' : ''}`}>
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default AutoComplete;
