import { Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';

interface ContextMenuProps {
  categorySeq: number;
}
function Category({ categorySeq }: ContextMenuProps) {
  console.log('categoryCode######## ', categorySeq);

  return (
    <Row>
      <Col sm={3}>
        <Table>
          <tbody>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
      <Col sm={3}>
        <Table>
          <tbody>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
            <tr>
              <td>분류명1</td>
              <td className="center">
                <FaArrowUp />
                <FaArrowDown />
              </td>
              <td className="center">
                <CiEdit />
                <AiOutlineDelete />
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}

export default Category;
