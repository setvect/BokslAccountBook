import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { ReqMemoModel } from '../../../common/ReqModel';
import IpcCaller from '../../common/IpcCaller';
import { showDeleteDialog } from '../util/util';
import MyDatePicker from './part/MyDatePicker';

export interface MemoModalHandle {
  openMemoModal: (selectDate: Date) => void;
  hideMemoModal: () => void;
}

export interface MemoModalProps {
  onSubmit: () => void;
}

const MemoModal = forwardRef<MemoModalHandle, MemoModalProps>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  // 등록폼 유효성 검사 스키마 생성
  const createValidationSchema = () => {
    const schemaFields: any = {
      memoDate: yup.string().required('날짜는 필수입니다.'),
      note: yup.string().required('메모는 필수입니다.').max(300, '메모는 최대 300자 이내로 작성해야 합니다.'),
    };
    return yup.object().shape(schemaFields);
  };

  const validationSchema = createValidationSchema();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    setFocus,
    watch,
  } = useForm<ReqMemoModel>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  useImperativeHandle(ref, () => ({
    openMemoModal: async (selectDate: Date) => {
      setShowModal(true);

      const memoSeq = await IpcCaller.getMemoSeqForDate(selectDate);
      if (memoSeq === 0) {
        setValue('note', '');
      } else {
        const memo = await IpcCaller.getMemo(memoSeq);
        setValue('note', memo.note);
      }

      setValue('memoSeq', memoSeq);
      setValue('memoDate', selectDate);
    },
    hideMemoModal: () => setShowModal(false),
  }));

  function changeMemoDate(diff: number) {
    const currentDate = getValues('memoDate');
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + diff);
    setValue('memoDate', newDate);
  }

  const onSubmit = async (data: ReqMemoModel) => {
    if (data.memoSeq === 0) {
      await IpcCaller.saveMemo(data);
    } else {
      await IpcCaller.updateMemo(data);
    }

    props.onSubmit();
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  const handleDeleteClick = async () => {
    if (memoSeq === 0) {
      return;
    }

    showDeleteDialog(async () => {
      await IpcCaller.deleteMemo(memoSeq);
      props.onSubmit();
      setShowModal(false);
    });
  };

  const memoSeq = watch('memoSeq');

  useEffect(() => {
    if (showModal) {
      setFocus('note');
    }
  }, [setFocus, showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>메모 {memoSeq === 0 ? '등록' : '수정'} </Modal.Title>
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
                          render={({ field }) => <MyDatePicker onChange={field.onChange} selected={field.value} className="form-control" />}
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
                  <Form.Control as="textarea" rows={7} {...register('note')} />
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
        {memoSeq !== 0 && (
          <Button variant="warning" onClick={() => handleDeleteClick()}>
            삭제
          </Button>
        )}
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
MemoModal.displayName = 'MemoModal';

export default MemoModal;
