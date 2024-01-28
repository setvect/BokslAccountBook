import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { GroupBase } from 'react-select';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CurrencyProperties, OptionNumberType } from '../../common/RendererModel';
import darkThemeStyles from '../../common/RendererConstant';
import CodeMapper from '../../mapper/CodeMapper';
import { CodeKind, Currency, CurrencyAmountModel } from '../../../common/CommonType';
import AccountMapper from '../../mapper/AccountMapper';
import { ReqAccountModel } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';

export interface AccountModalHandle {
  openAccountModal: (accountSeq: number) => void;
  hideTradeModal: () => void;
}

export interface AccountModalPropsMethods {
  onSubmit: () => void;
}

const AccountModal = forwardRef<AccountModalHandle, AccountModalPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      name: yup.string().required('이름을 입력하세요.'),
      assetType: yup.number().test('is-not-zero', '자산유형을 선택해 주세요.', (value) => value !== 0),
      accountType: yup.number().test('is-not-zero', '계좌성격을 선택해 주세요.', (value) => value !== 0),
      balance: yup
        .array()
        .of(
          yup.object().shape({
            currency: yup.string().required('통화를 선택하세요.'),
            amount: yup.number().typeError('금액은 숫자여야 합니다.').required('금액을 입력하세요.'),
          }),
        )
        .required('잔고는 필수입니다.'),
      note: yup.string().max(300, '메모는 최대 300자 이내로 작성해야 합니다.'),
    };
    return yup.object().shape(schemaFields);
  };

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
    watch,
  } = useForm<ReqAccountModel>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  const accountSeq = watch('accountSeq');

  useImperativeHandle(ref, () => ({
    openAccountModal: (accountSeq: number) => {
      setShowModal(true);
      if (accountSeq === 0) {
        reset({
          accountSeq: 0,
          name: '',
          accountNumber: '',
          assetType: 0,
          accountType: 0,
          stockF: false,
          balance: (Object.keys(CurrencyProperties) as Currency[]).map(
            (currency) =>
              ({
                currency,
                amount: 0,
              }) as CurrencyAmountModel,
          ),
          interestRate: '',
          term: '',
          expDate: '',
          monthlyPay: '',
          transferDate: '',
          note: '',
          enableF: true,
        });
      } else {
        const accountModel = AccountMapper.getAccount(accountSeq)!;
        reset({
          ...accountModel,
          balance: (Object.keys(CurrencyProperties) as Currency[]).map(
            (currency) =>
              ({
                currency,
                amount: accountModel.balance.find((balance) => balance.currency === currency)?.amount ?? 0,
              }) as CurrencyAmountModel,
          ),
        });
      }
    },
    hideTradeModal: () => setShowModal(false),
  }));

  const onSubmit = async (data: ReqAccountModel) => {
    if (data.accountSeq === 0) {
      await IpcCaller.saveAccount(data);
    } else {
      await IpcCaller.updateAccount(data);
    }
    props.onSubmit();
    setShowModal(false);
  };

  const handleConfirmClick = (event: React.FormEvent) => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (showModal) {
      setFocus('name');
    }
  }, [setFocus, showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>계좌 {accountSeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  이름
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('name')} maxLength={30} />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  계좌번호
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('accountNumber')} maxLength={30} />
                  {errors.accountNumber && <span className="error">{errors.accountNumber.message}</span>}
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  자산유형
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="assetType"
                    render={({ field }) => {
                      const optionList = CodeMapper.getSubOptionList(CodeKind.ASSET_TYPE);
                      return (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          value={optionList.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={optionList}
                          placeholder="자산종류 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      );
                    }}
                  />
                  {errors.assetType && <span className="error">{errors.assetType.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  계좌성격
                </Form.Label>
                <Col sm={9}>
                  <Controller
                    control={control}
                    name="accountType"
                    render={({ field }) => {
                      const optionList = CodeMapper.getSubOptionList(CodeKind.ACCOUNT_TYPE);
                      return (
                        <Select<OptionNumberType, false, GroupBase<OptionNumberType>>
                          value={optionList.find((option) => option.value === field.value)}
                          onChange={(option) => field.onChange(option?.value)}
                          options={optionList}
                          placeholder="계좌성격 선택"
                          className="react-select-container"
                          styles={darkThemeStyles}
                        />
                      );
                    }}
                  />
                  {errors.accountType && <span className="error">{errors.accountType.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  주식계좌 여부
                </Form.Label>
                <Col sm={9} className="d-flex align-items-center">
                  <Controller
                    name="stockF"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Form.Check
                          type="radio"
                          id="stockF-yes"
                          label="예"
                          value="true"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="me-2"
                        />
                        <Form.Check
                          type="radio"
                          id="stockF-no"
                          label="아니오"
                          value="false"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="me-2"
                        />
                      </>
                    )}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-2">
                <Form.Label column sm={3}>
                  잔고
                </Form.Label>
                <Col sm={9}>
                  {Object.entries(CurrencyProperties).map(([currency, { name, symbol }], index) => (
                    <Row className="mb-2" key={currency}>
                      <Col sm={3}>
                        {name} ({symbol})
                      </Col>
                      <Col sm={9}>
                        <Controller
                          control={control}
                          name={`balance.${index}.amount`}
                          render={({ field }) => (
                            <NumericFormat
                              thousandSeparator
                              maxLength={12}
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.floatValue);
                              }}
                              className="form-control"
                              style={{ textAlign: 'right' }}
                            />
                          )}
                        />
                        {errors.balance?.[index]?.currency && (
                          <span className="error">
                            {
                              // @ts-ignore
                              errors.balance[index].currency.message
                            }
                          </span>
                        )}
                        {errors.balance?.[index]?.amount && (
                          <span className="error">
                            {
                              // @ts-ignore
                              errors.balance[index].amount.message
                            }
                          </span>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  이율
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('interestRate')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  계약기간
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('term')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  만기일
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('expDate')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  월 납입액
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('monthlyPay')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  이체일
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('transferDate')} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  메모 내용
                </Form.Label>
                <Col sm={9}>
                  <Form.Control as="textarea" {...register('note')} maxLength={300} />
                  {errors.note && <span className="error">{errors.note.message}</span>}
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  활성
                </Form.Label>
                <Col sm={9} className="d-flex align-items-center">
                  <Controller
                    name="enableF"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Form.Check
                          type="radio"
                          id="enableF-yes"
                          label="활성"
                          value="true"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="me-2"
                        />
                        <Form.Check
                          type="radio"
                          id="enableF-no"
                          label="비활성"
                          value="false"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="me-2"
                        />
                      </>
                    )}
                  />
                </Col>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={handleConfirmClick}>
          저장
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
AccountModal.displayName = 'AccountModal';

export default AccountModal;
