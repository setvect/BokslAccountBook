import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AccountType, MemoForm } from '../../type/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';

export interface MemoModalHandle {
  openMemoModal: (item: MemoForm, saveCallback: () => void) => void;
  hideMemoModal: () => void;
}

const MemoModal = forwardRef<MemoModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<MemoForm>({
    memoDate: new Date(),
    note: '안녕',
  });

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      memoDate: yup.string().required('날짜는 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.').max(50, '메모는 최대 50자 이내로 작성해야 합니다.'),
    };
    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<MemoForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openMemoModal: (item: MemoForm, callback: () => void) => {
      setShowModal(true);
      setForm(item);
      setParentCallback(() => callback);
      reset();
    },
    hideMemoModal: () => setShowModal(false),
  }));

  function changeMemoDate(diff: number) {
    const currentDate = getValues('memoDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('memoDate', newDate);
  }

  const onSubmit = (data: MemoForm) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const input = document.getElementById('memoNote');
    input?.focus();
  }, []);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>메모 등록</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  날짜
                </Form.Label>
                <Col sm={9}>
                  <Row>
                    <Col sm={7}>
                      <div className="form-group">
                        <Controller
                          control={control}
                          name="memoDate"
                          render={({ field }) => (
                            <DatePicker dateFormat="yyyy-MM-dd" onChange={field.onChange} selected={field.value} className="form-control" />
                          )}
                        />
                      </div>
                      {errors.memoDate && (
                        <span className="error" style={{ display: 'block' }}>
                          {errors.memoDate.message}
                        </span>
                      )}
                    </Col>
                    <Col>
                      <Button variant="outline-success" onClick={() => changeMemoDate(-1)}>
                        전날
                      </Button>
                      <Button variant="outline-success" style={{ marginLeft: '5px' }} onClick={() => changeMemoDate(1)}>
                        다음날
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  메모
                </Form.Label>
                <Col sm={9}>
                  <Form.Control as="textarea" id="memoNote" {...register('note')} />
                  {errors.note && <span className="error">{errors.note.message}</span>}
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
MemoModal.displayName = 'MemoModal';

export default MemoModal;
