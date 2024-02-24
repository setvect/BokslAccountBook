import { Button, Col, ListGroup, Modal, Row } from 'react-bootstrap';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import CategoryMapper from '../../mapper/CategoryMapper';
import { showInfoDialog } from '../util/util';
import { ResCategoryModel } from '../../../common/ResModel';
import { TransactionKind } from '../../../common/CommonType';

export interface TransactionCategoryModalHandle {
  openTransactionCategoryModal: (transactionKind: TransactionKind) => void;
  hideTransactionCategoryModal: () => void;
}

export interface TransactionCategoryModelPropsMethods {
  onSelect: (categorySeq: number) => void;
}

interface CategoryState {
  mainSelect: number;
  subSelect: number;
  mainList: ResCategoryModel[];
  subList: ResCategoryModel[];
}

const TransactionCategoryModal = forwardRef<TransactionCategoryModalHandle, TransactionCategoryModelPropsMethods>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [transactionKind, setTransactionKind] = useState<TransactionKind>(TransactionKind.SPENDING);
  const [categoryState, setCategoryState] = useState<CategoryState>({
    mainSelect: 0,
    subSelect: 0,
    mainList: [],
    subList: [],
  });

  useImperativeHandle(ref, () => ({
    openTransactionCategoryModal: (transactionKind: TransactionKind) => {
      const mainCategoryList = CategoryMapper.getList(transactionKind);
      setCategoryState((prevState) => ({
        ...prevState,
        mainList: mainCategoryList,
      }));
      setTransactionKind(transactionKind);
      setShowModal(true);
    },
    hideTransactionCategoryModal: () => setShowModal(false),
  }));

  const handleConfirmClick = () => {
    if (categoryState.subSelect === 0) {
      showInfoDialog('하위 분류를 선택해 주세요.');
      return;
    }
    props.onSelect(categoryState.subSelect);
    setShowModal(false);
  };

  const handleCategoryMainClick = (category: ResCategoryModel) => {
    setCategoryState((prevState) => ({
      ...prevState,
      mainSelect: category.categorySeq,
      subSelect: 0,
    }));
  };

  const handleCategorySubClick = (category: ResCategoryModel) => {
    setCategoryState((prevState) => ({
      ...prevState,
      subSelect: category.categorySeq,
    }));
  };

  useEffect(() => {
    if (categoryState.mainSelect === 0) {
      return;
    }

    setCategoryState((prevState) => ({
      ...prevState,
      subList: CategoryMapper.getList(transactionKind, categoryState.mainSelect),
    }));
  }, [transactionKind, categoryState.mainSelect]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} animation={false} centered data-bs-theme="dark">
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
