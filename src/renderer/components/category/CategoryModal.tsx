import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { CategoryFrom } from '../../../common/ReqModel';
import { IPC_CHANNEL, TransactionKind } from '../../../common/CommonType';
import CategoryMapper from '../../mapper/CategoryMapper';

export interface CategoryModalHandle {
  openCategoryModal: (categorySeq: number, parentSeq: number, transactionKind: TransactionKind) => void;
  hideCategoryModal: () => void;
}

export interface CategoryModelPropsMethods {
  onSubmit: () => void;
}

const CategoryModal = forwardRef<CategoryModalHandle, CategoryModelPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  const createValidationSchema = () => {
    const schemaFields: any = {
      name: yup.string().required('이름음 필수입니다.'),
    };
    return yup.object().shape(schemaFields);
  };

  const validationSchema = createValidationSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
    watch,
  } = useForm<CategoryFrom>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  const categorySeq = watch('categorySeq');

  useImperativeHandle(ref, () => ({
    openCategoryModal: (categorySeq: number, parentSeq: number, transactionKind: TransactionKind) => {
      setShowModal(true);
      reset({
        kind: transactionKind,
        categorySeq,
        name: categorySeq === 0 ? '' : CategoryMapper.getName(categorySeq) || '',
        parentSeq,
      });
    },
    hideCategoryModal: () => setShowModal(false),
  }));

  const onSubmit = (data: CategoryFrom) => {
    const channel = data.categorySeq === 0 ? IPC_CHANNEL.CallCategorySave : IPC_CHANNEL.CallCategoryUpdate;
    window.electron.ipcRenderer.once(channel, () => {
      props.onSubmit();
      setShowModal(false);
    });
    window.electron.ipcRenderer.sendMessage(channel, data);
  };

  const handleConfirmClick = () => {
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
        <Modal.Title>분류 {categorySeq === 0 ? '등록' : '수정'}</Modal.Title>
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
                  <Form.Control type="text" id="categoryName" {...register('name')} maxLength={30} />
                  {errors.name && <span className="error">{errors.name.message}</span>}
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
CategoryModal.displayName = 'CategoryModal';

export default CategoryModal;
