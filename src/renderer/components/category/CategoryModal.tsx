import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CategoryFrom } from '../../common/BokslTypes';
import 'react-datepicker/dist/react-datepicker.css';

export interface CategoryModalHandle {
  openCategoryModal: (categorySeq: number, saveCallback: () => void) => void;
  hideCategoryModal: () => void;
}

const CategoryModal = forwardRef<CategoryModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [parentCallback, setParentCallback] = useState<() => void>(() => {});
  const [form, setForm] = useState<CategoryFrom>({
    categorySeq: 0,
    name: '',
  });

  // 등록폼 유효성 검사 스키마 생성
  function createValidationSchema() {
    const schemaFields: any = {
      name: yup.string().required('이름음 필수입니다.'),
    };
    return yup.object().shape(schemaFields);
  }

  const validationSchema = createValidationSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFrom>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });

  useImperativeHandle(ref, () => ({
    openCategoryModal: (categorySeq: number, callback: () => void) => {
      setShowModal(true);
      // TODO 값 불러오기
      // setForm(item);
      setForm({ ...form, categorySeq });
      setParentCallback(() => callback);
      reset();
    },
    hideCategoryModal: () => setShowModal(false),
  }));

  const onSubmit = (data: CategoryFrom) => {
    console.log(data);
    parentCallback();
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }
    const input = document.getElementById('categoryName');
    input?.focus();
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>카테고리 {form.categorySeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  메모
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
CategoryModal.displayName = 'MemoModal';

export default CategoryModal;
