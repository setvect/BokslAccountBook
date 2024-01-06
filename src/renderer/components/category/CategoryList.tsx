import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useEffect, useRef, useState } from 'react';
import CategoryModal, { CategoryModalHandle } from './CategoryModal';
import CategoryMapper from '../../mapper/CategoryMapper';
import { ResCategoryModel } from '../../../common/ResModel';
import { TransactionKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { showDeleteDialog } from '../util/util';

interface ContextMenuProps {
  transactionKind: TransactionKind;
}

type CategoryLocation = 'main' | 'sub';

function CategoryList({ transactionKind }: ContextMenuProps) {
  const [selectMainCategorySeq, setSelectMainCategorySeq] = useState<number>(0);
  const categoryModalRef = useRef<CategoryModalHandle>(null);
  const [categoryMainList, setCategoryMainList] = useState<ResCategoryModel[]>([]);
  const [categorySubList, setCategorySubList] = useState<ResCategoryModel[] | null>(null);

  const reloadCategory = async () => {
    await CategoryMapper.loadList();
    const reloadCodeList = CategoryMapper.getList(transactionKind);
    setCategoryMainList(reloadCodeList);

    if (selectMainCategorySeq === 0) {
      return;
    }

    setCategorySubList(CategoryMapper.getList(transactionKind, selectMainCategorySeq));
  };

  const updateOrderCode = async (firstItem: ResCategoryModel, secondItem: ResCategoryModel) => {
    await IpcCaller.updateCategoryOrder([
      { categorySeq: firstItem.categorySeq, orderNo: secondItem.orderNo },
      { categorySeq: secondItem.categorySeq, orderNo: firstItem.orderNo },
    ]);

    await reloadCategory();
  };

  const changeOrder = async (categorySeq: number, direction: 'up' | 'down', location: CategoryLocation) => {
    let categoryList: ResCategoryModel[];
    if (location === 'main') {
      categoryList = categoryMainList;
    } else {
      if (!categorySubList) {
        return;
      }
      categoryList = categorySubList;
    }

    const index = categoryList.findIndex((category) => category.categorySeq === categorySeq);
    if (index === -1) {
      return;
    }

    const swapIndex = direction === 'down' ? index + 1 : index - 1;
    await updateOrderCode(categoryList[index], categoryList[swapIndex]);
  };
  const handleDownClick = async (categorySeq: number, location: CategoryLocation) => {
    await changeOrder(categorySeq, 'down', location);
  };

  const handleUpClick = async (categorySeq: number, location: CategoryLocation) => {
    await changeOrder(categorySeq, 'up', location);
  };

  const handleAddCategory = (parentSeq: number) => {
    categoryModalRef.current?.openCategoryModal(0, parentSeq, transactionKind);
  };

  const handleEditCategory = (categorySeq: number) => {
    if (!categoryModalRef.current) {
      return;
    }

    const category = CategoryMapper.getCategory(categorySeq);
    if (!category) {
      console.error('카테고리 정보가 없습니다.');
      return;
    }

    categoryModalRef.current?.openCategoryModal(categorySeq, category.parentSeq, transactionKind);
  };

  const handleDeleteCategory = (categorySeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteCategory(categorySeq);
      await reloadCategory();
    });
  };

  const handleCategoryMainClick = (categorySeq: number) => {
    setSelectMainCategorySeq(categorySeq);
    setCategorySubList(CategoryMapper.getList(transactionKind, categorySeq));
  };

  useEffect(() => {
    const mainCategoryList = CategoryMapper.getList(transactionKind);
    setCategoryMainList(mainCategoryList);
  }, [transactionKind]);

  return (
    <>
      <Row>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              {categoryMainList.map((category, index) => {
                return (
                  <tr key={category.categorySeq}>
                    <td>
                      <Button variant="link" onClick={() => handleCategoryMainClick(category.categorySeq)}>
                        {category.name}
                      </Button>
                    </td>
                    <td className="center">
                      {index > 0 && (
                        <Button variant="link" onClick={() => handleUpClick(category.categorySeq, 'main')}>
                          <FaArrowUp />
                        </Button>
                      )}
                      {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                      {index < categoryMainList.length - 1 && (
                        <Button variant="link" onClick={() => handleDownClick(category.categorySeq, 'main')}>
                          <FaArrowDown />
                        </Button>
                      )}
                      {index === categoryMainList.length - 1 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                    </td>
                    <td className="center">
                      <Button variant="link" onClick={() => handleEditCategory(category.categorySeq)}>
                        <CiEdit />
                      </Button>
                      <Button variant="link" onClick={() => handleDeleteCategory(category.categorySeq)}>
                        <AiOutlineDelete />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Button onClick={() => handleAddCategory(0)} variant="outline-success" style={{ width: '100%' }}>
            추가
          </Button>
        </Col>
        {categorySubList && (
          <Col sm={3}>
            <Table className="category">
              <tbody>
                {categorySubList.map((category, index) => {
                  return (
                    <tr key={category.categorySeq}>
                      <td>{category.name}</td>
                      <td className="center">
                        {index > 0 && (
                          <Button variant="link" onClick={() => handleUpClick(category.categorySeq, 'sub')}>
                            <FaArrowUp />
                          </Button>
                        )}
                        {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                        {index < categorySubList.length - 1 && (
                          <Button variant="link" onClick={() => handleDownClick(category.categorySeq, 'sub')}>
                            <FaArrowDown />
                          </Button>
                        )}
                        {index === categorySubList.length - 1 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                      </td>
                      <td className="center">
                        <Button variant="link" onClick={() => handleEditCategory(category.categorySeq)}>
                          <CiEdit />
                        </Button>
                        <Button variant="link" onClick={() => handleDeleteCategory(category.categorySeq)}>
                          <AiOutlineDelete />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Button onClick={() => handleAddCategory(selectMainCategorySeq)} variant="outline-success" style={{ width: '100%' }}>
              추가
            </Button>
          </Col>
        )}
      </Row>
      <CategoryModal ref={categoryModalRef} onSubmit={reloadCategory} />
    </>
  );
}

export default CategoryList;
