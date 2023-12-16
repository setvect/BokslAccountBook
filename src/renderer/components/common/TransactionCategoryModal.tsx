import { Button, Col, ListGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CategoryMapper, { CategoryKind, CategoryMapping } from '../../mapper/CategoryMapper';
import { showInfoDialog } from '../util/util';

export interface TransactionCategoryModalHandle {
  openTransactionCategoryModal: (categoryKind: CategoryKind, selectCallback: (categorySeq: number) => void) => void;
  hideTransactionCategoryModal: () => void;
}

interface CategoryState {
  mainSelect: number;
  subSelect: number;
  mainList: CategoryMapping[];
  subList: CategoryMapping[];
}

const TransactionCategoryModal = forwardRef<TransactionCategoryModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<((categorySeq: number) => void) | null>(null);
  const [categoryKind, setCategoryKind] = useState<CategoryKind>(CategoryKind.SPENDING);
  const [categoryState, setCategoryState] = useState<CategoryState>({
    mainSelect: 0,
    subSelect: 0,
    mainList: [],
    subList: [],
  });

  useImperativeHandle(ref, () => ({
    openTransactionCategoryModal: (categoryKind: CategoryKind, selectCallback: (categorySeq: number) => void) => {
      const mainCategoryList = CategoryMapper.getCategoryList(categoryKind);
      setCategoryState((prevState) => ({
        ...prevState,
        mainList: mainCategoryList,
      }));
      setCategoryKind(categoryKind);
      setShowModal(true);
      setConfirm(() => selectCallback);
    },
    hideTransactionCategoryModal: () => setShowModal(false),
  }));

  const handleConfirmClick = () => {
    if (categoryState.subSelect === 0) {
      showInfoDialog('하위 분류를 선택해 주세요.');
      return;
    }
    confirm?.(categoryState.subSelect);
    setShowModal(false);
  };

  function handleCategoryMainClick(category: CategoryMapping) {
    setCategoryState((prevState) => ({
      ...prevState,
      mainSelect: category.categorySeq,
      subSelect: 0,
    }));
  }

  function handleCategorySubClick(category: CategoryMapping) {
    setCategoryState((prevState) => ({
      ...prevState,
      subSelect: category.categorySeq,
    }));
  }

  useEffect(() => {
    if (categoryState.mainSelect === 0) {
      return;
    }

    setCategoryState((prevState) => ({
      ...prevState,
      subList: CategoryMapper.getCategoryList(categoryKind, categoryState.mainSelect),
    }));
  }, [categoryKind, categoryState.mainSelect]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>분류 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
          <Col>
            <div style={{ height: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {categoryState.mainList.map((category) => {
                  return (
                    <ListGroup.Item
                      key={category.categorySeq}
                      action
                      active={category.categorySeq === categoryState.mainSelect}
                      onClick={() => handleCategoryMainClick(category)}
                    >
                      {category.name}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </div>
          </Col>
          <Col>
            <div style={{ height: '200px', overflowY: 'auto' }}>
              <ListGroup>
                {categoryState.subList.map((category) => {
                  return (
                    <ListGroup.Item
                      key={category.categorySeq}
                      action
                      active={category.categorySeq === categoryState.subSelect}
                      onClick={() => handleCategorySubClick(category)}
                    >
                      {category.name}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </div>
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
TransactionCategoryModal.displayName = 'TransactionCategoryModal';

export default TransactionCategoryModal;
