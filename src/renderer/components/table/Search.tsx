import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import React, { forwardRef, useCallback, useState } from 'react';
import { AccountType, AccountTypeProperties, OptionNumberType } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import { ResSearchModel } from '../../../common/ResModel';
import { showWarnDialog } from '../util/util';
import AccountMapper from '../../mapper/AccountMapper';

export interface SearchProps {
  onSearch: (searchModel: ResSearchModel) => void;
  // eslint-disable-next-line react/require-default-props
  accountTypeList?: AccountType[];
}

export interface SearchPropsMethods {
  reload: () => void;
}

// const CalendarPart = forwardRef<CalendarPartMethods, CalendarPartProps>((props, ref) => {
const Search = forwardRef<SearchPropsMethods, SearchProps>(({ accountTypeList = [], ...props }, ref) => {
  const now = new Date();
  const options = AccountMapper.getOptionList();
  options.unshift({ value: 0, label: '--- 전체 ---' });

  const [searchModel, setSearchModel] = useState<ResSearchModel>({
    note: '',
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    accountSeq: 0,
    checkType: new Set(accountTypeList),
  });

  const handleMonthChange = (months: number) => {
    let newMonth;
    if (months === 0) {
      newMonth = new Date(now.getFullYear(), now.getMonth() + months, 1);
    } else {
      newMonth = new Date(searchModel.from.getFullYear(), searchModel.from.getMonth() + months, 1);
    }

    setSearchModel({
      ...searchModel,
      from: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
      to: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
    });
  };

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSearchModel((prevState) => {
      const newCheckType = new Set(prevState.checkType);
      if (type === 'checkbox') {
        if (checked) {
          newCheckType.add(name as AccountType);
        } else {
          newCheckType.delete(name as AccountType);
        }
      } else {
        return { ...prevState, [name]: value };
      }
      return { ...prevState, checkType: newCheckType };
    });
  }, []);

  const handleSearch = () => {
    if (searchModel.from > searchModel.to) {
      showWarnDialog('시작일이 종료일보다 커요');
    }
    props.onSearch(searchModel);
  };

  return (
    <>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>
          시작일
        </Form.Label>
        <Col sm={9}>
          <DatePicker
            selected={searchModel.from}
            dateFormat="yyyy-MM-dd"
            onChange={(date: Date) => {
              setSearchModel({ ...searchModel, from: date });
            }}
            className="form-control form-control-sm"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>
          종료일
        </Form.Label>
        <Col sm={9}>
          <DatePicker
            selected={searchModel.to}
            dateFormat="yyyy-MM-dd"
            onChange={(date: Date) => {
              setSearchModel({ ...searchModel, to: date });
            }}
            className="form-control form-control-sm"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>
          계좌
        </Form.Label>
        <Col sm={9}>
          <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
            value={options.find((option) => option.value === searchModel.accountSeq)}
            onChange={(selectedOption) =>
              setSearchModel({
                ...searchModel,
                accountSeq: selectedOption ? selectedOption.value : 0,
              })
            }
            options={options}
            placeholder="계좌 선택"
            className="react-select-container"
            styles={darkThemeStyles}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={3}>
          메모
        </Form.Label>
        <Col sm={9}>
          <FormControl name="note" value={searchModel.note} onChange={handleChange} maxLength={30} />
        </Col>
      </Form.Group>
      {accountTypeList.length !== 0 && (
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>
            유형
          </Form.Label>
          <Col sm={9}>
            <div style={{ display: 'inline-block', marginTop: '7px' }}>
              {accountTypeList.map((accountType) => (
                <Form.Check
                  inline
                  key={accountType}
                  label={AccountTypeProperties[accountType].label}
                  type="checkbox"
                  id={`check-${accountType}`}
                  name={accountType}
                  checked={searchModel.checkType.has(accountType)}
                  onChange={handleChange}
                />
              ))}
            </div>
          </Col>
        </Form.Group>
      )}
      <Row>
        <Col sm={12}>
          <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(-1)}>
            이전달
          </Button>
          <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(0)}>
            이번달
          </Button>
          <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(1)}>
            다음달
          </Button>
          <Button onClick={handleSearch} size="sm" variant="primary" className="me-2">
            검색
          </Button>
        </Col>
      </Row>
    </>
  );
});

export default Search;
