import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReqCodeModel } from '../../../common/ReqModel';
import { CodeKind } from '../../../common/CommonType';
import CodeMapper from '../../mapper/CodeMapper';
import IpcCaller from '../../common/IpcCaller';

export interface CodeModalHandle {
  openCodeModal: (codeSeq: number, codeMainId: CodeKind) => void;
  hideCodeModal: () => void;
}

export interface CodeModelPropsMethods {
  onSubmit: () => void;
}

const CodeModal = forwardRef<CodeModalHandle, CodeModelPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);

  // 등록폼 유효성 검사 스키마 생성
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
  } = useForm<ReqCodeModel>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
  });

  const codeItemSeq = watch('codeItemSeq');

  useImperativeHandle(ref, () => ({
    openCodeModal: (codeSeq: number, codeMainId: CodeKind) => {
      setShowModal(true);
      reset({
        codeItemSeq: codeSeq,
        codeMainId,
        name: codeSeq === 0 ? '' : CodeMapper.getValue(codeMainId, codeSeq) || '',
      });
    },
    hideCodeModal: () => setShowModal(false),
  }));

  const onSubmit = async (data: ReqCodeModel) => {
    if (data.codeItemSeq === 0) {
      await IpcCaller.saveCode(data);
    } else {
      await IpcCaller.updateCode(data);
    }
    props.onSubmit();
    setShowModal(false);
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
    <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>코드 {codeItemSeq === 0 ? '등록' : '수정'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <Form onSubmit={(event) => event.preventDefault()}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  이름
                </Form.Label>
                <Col sm={9}>
                  <Form.Control type="text" {...register('name')} maxLength={30} />
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
CodeModal.displayName = 'CodeModal';

export default CodeModal;
