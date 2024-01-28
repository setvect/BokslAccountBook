import React, { ChangeEvent, forwardRef, KeyboardEvent, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import CategoryMapper from '../../mapper/CategoryMapper';
import { TransactionKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ResCategoryModel } from '../../../common/ResModel';

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
      // 1. 이전에 입력했던 거래 내역을 기준으로 분류를 찾음
      const categorySeqList = await IpcCaller.getTransactionCategoryByNote(kind, inputValue);
      const categoryByTransactionList = CategoryMapper.getSubList(kind).filter((category) => categorySeqList.includes(category.categorySeq));

      // 2. 분류명을 기준으로 분류를 찾음
      const categoryByNameList = CategoryMapper.getSubList(kind).filter((category) => category.name.includes(inputValue));

      // 3. 합침
      const mergedCategories: ResCategoryModel[] = categoryByTransactionList.concat(categoryByNameList);

      // 3. 중복제거
      const uniqueCategories: ResCategoryModel[] = mergedCategories.filter(
        (category, index, self) => index === self.findIndex((c) => c.categorySeq === category.categorySeq),
      );

      return Promise.resolve(
        uniqueCategories.map((category) => {
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

    (async () => loadData())();
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
    setInputValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsUserInput(true);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
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
