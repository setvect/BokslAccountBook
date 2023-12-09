import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import CategoryModal, { CategoryModalHandle } from './CategoryModal';

interface ContextMenuProps {
  categorySeq: number;
}

function Category({ categorySeq }: ContextMenuProps) {
  const categoryModalRef = useRef<CategoryModalHandle>(null);

  const handleClick = useCallback(() => {
    console.log('Arrow Up clicked');
    // Arrow Up 클릭시 실행할 로직
  }, []);

  function addCategory() {
    if (!categoryModalRef.current) {
      return;
    }

    categoryModalRef.current?.openCategoryModal(0, () => {
      console.log('add');
    });
  }

  function editCategory(categorySeq: number) {
    if (!categoryModalRef.current) {
      return;
    }

    categoryModalRef.current?.openCategoryModal(categorySeq, () => {
      console.log('edit');
    });
  }

  function deleteCategory(categorySeq: number) {
    Swal.fire({
      title: '삭제할까요?',
      icon: 'warning',
      showCancelButton: true,
      showClass: {
        popup: '',
      },
      hideClass: {
        popup: '',
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          console.log('삭제 처리');
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.error('삭제 작업 중 오류가 발생했습니다:', error);
      });
  }

  return (
    <>
      <Row>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              <tr>
                <td>분류명1</td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowUp />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowDown />
                  </Button>
                </td>
                <td className="center">
                  <Button variant="link" onClick={() => editCategory(1)}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={() => deleteCategory(1)}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
              <tr>
                <td>분류명2</td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowUp />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowDown />
                  </Button>
                </td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
              <tr>
                <td>분류명3</td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowUp />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowDown />
                  </Button>
                </td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
          <Button onClick={() => addCategory()} variant="outline-success" style={{ width: '100%' }}>
            추가
          </Button>
        </Col>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              <tr>
                <td>분류명1</td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowUp />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowDown />
                  </Button>
                </td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
              <tr>
                <td>분류명1</td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowUp />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <FaArrowDown />
                  </Button>
                </td>
                <td className="center">
                  <Button variant="link" onClick={handleClick}>
                    <CiEdit />
                  </Button>
                  <Button variant="link" onClick={handleClick}>
                    <AiOutlineDelete />
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
          <Button onClick={() => addCategory()} variant="outline-success" style={{ width: '100%' }}>
            추가
          </Button>
        </Col>
      </Row>
      <CategoryModal ref={categoryModalRef} />
    </>
  );
}

export default Category;
