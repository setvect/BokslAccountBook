import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useCallback } from 'react';

interface ContextMenuProps {
  categorySeq: number;
}
function Category({ categorySeq }: ContextMenuProps) {
  console.log('categoryCode######## ', categorySeq);

  const handleClick = useCallback(() => {
    console.log('Arrow Up clicked');
    // Arrow Up 클릭시 실행할 로직
  }, []);

  return (
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
                <Button variant="link" onClick={handleClick}>
                  <CiEdit />
                </Button>
                <Button variant="link" onClick={handleClick}>
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
      </Col>
    </Row>
  );
}

export default Category;
