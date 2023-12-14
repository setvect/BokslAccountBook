import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useCallback, useRef } from 'react';
import CodeModal, { CodeModalHandle } from './CodeModal';
import { deleteConfirm } from '../util/util';

function Code() {
  const codeModalRef = useRef<CodeModalHandle>(null);

  const handleClick = useCallback(() => {
    console.log('Arrow Up clicked');
    // Arrow Up 클릭시 실행할 로직
  }, []);

  function addCode() {
    if (!codeModalRef.current) {
      return;
    }

    codeModalRef.current?.openCodeModal(0, () => {
      console.log('add');
    });
  }

  function editCategory(codeSeq: number) {
    if (!codeModalRef.current) {
      return;
    }

    codeModalRef.current?.openCodeModal(codeSeq, () => {
      console.log('edit');
    });
  }

  function deleteCategory(codeSeq: number) {
    deleteConfirm(() => {
      console.log('삭제 처리');
    });
  }

  return (
    <>
      <Row>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              <tr>
                <td>코드명1</td>
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
                <td>코드명2</td>
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
                <td>코드명3</td>
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
          <Button onClick={() => addCode()} variant="outline-success" style={{ width: '100%' }}>
            추가
          </Button>
        </Col>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              <tr>
                <td>코드명1</td>
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
                <td>코드명1</td>
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
          <Button onClick={() => addCode()} variant="outline-success" style={{ width: '100%' }}>
            추가
          </Button>
        </Col>
      </Row>
      <CodeModal ref={codeModalRef} />
    </>
  );
}

export default Code;
