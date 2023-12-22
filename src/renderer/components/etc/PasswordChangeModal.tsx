import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { showInfoDialog } from '../util/util';

export interface PasswordChangeModalHandle {
  openPasswordChangeModal: () => void;
  hidePasswordChangeModal: () => void;
}

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const PasswordChangeModal = forwardRef<PasswordChangeModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const createValidationSchema = () => {
    const schemaFields: any = {
      currentPassword: yup.string().required('현재 비밀번호는 필수입니다.'),
      newPassword: yup.string().required('새 비밀번호는 필수입니다.'),
      confirmPassword: yup
        .string()
        .required('비밀번호 확인은 필수입니다.')
        .test('is-different-from-currentPassword', '새 비밀번호와 같을 수 없습니다.', (value, context) => {
          const { currentPassword } = context.parent;
          return value !== currentPassword;
        })
        .test('is-different-from-newPassword', '입력한 비밀번호가 서로 다릅니다.', (value, context) => {
          const { newPassword } = context.parent;
          return value === newPassword;
        }),
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
  } = useForm<PasswordForm>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: form,
  });
  const onSubmit = (data: PasswordForm) => {
    // TODO 현재 비밀번호 체크 로직
    console.log(form);
    showInfoDialog('비밀번호 변경했어요.');
    setShowModal(false);
  };

  const handleConfirmClick = () => {
    handleSubmit(onSubmit)();
  };

  useImperativeHandle(ref, () => ({
    openPasswordChangeModal: () => {
      setShowModal(true);
      reset();
    },
    hidePasswordChangeModal: () => setShowModal(false),
  }));

  useEffect(() => {
    if (showModal) {
      setFocus('currentPassword');
    }
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>비밀번호 변경</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form>
              <Form.Group className="mb-3" controlId="formCurrentPassword">
                <Form.Label>현재 비밀번호</Form.Label>
                <Form.Control type="password" {...register('currentPassword')} maxLength={20} />
                {errors.currentPassword && <span className="error">{errors.currentPassword.message}</span>}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formNewPassword">
                <Form.Label>새 비밀번호</Form.Label>
                <Form.Control type="password" {...register('newPassword')} maxLength={20} />
                {errors.newPassword && <span className="error">{errors.newPassword.message}</span>}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formConfirmPassword">
                <Form.Label>비밀번호 다시 입력</Form.Label>
                <Form.Control type="password" {...register('confirmPassword')} maxLength={20} />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={handleConfirmClick}>
          확인
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
PasswordChangeModal.displayName = 'PasswordChangeModal';

export default PasswordChangeModal;
