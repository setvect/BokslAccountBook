import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useRef, useState } from 'react';
import CodeModal, { CodeModalHandle } from './CodeModal';
import { showDeleteDialog } from '../util/util';
import CodeMapper, { CodeMapping } from '../../mapper/CodeMapper';

function Code() {
  const [codeList, setCodeList] = useState(CodeMapper.getCodeList());
  const [currentMainCode, setCurrentMainCode] = useState<CodeMapping | null>(null);
  const codeModalRef = useRef<CodeModalHandle>(null);

  const handleDownClick = (categorySeq: number) => {
    console.log('Arrow Down clicked');
  };

  const handleUpClick = (categorySeq: number) => {
    console.log('Arrow Up clicked');
  };

  const handleAddCodeClick = () => {
    if (!codeModalRef.current) {
      return;
    }

    codeModalRef.current?.openCodeModal(0, () => {
      console.log('add');
    });
  };

  const handleEditCodeClick = (codeSeq: number) => {
    if (!codeModalRef.current) {
      return;
    }

    codeModalRef.current?.openCodeModal(codeSeq, () => {
      console.log('edit');
    });
  };

  const handleMainCodeClick = (code: CodeMapping) => {
    setCurrentMainCode(code);
  };

  const handleDeleteCodeClick = (codeSeq: number) => {
    showDeleteDialog(() => {
      console.log('삭제 처리');
    });
  };

  return (
    <>
      <Row>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              {codeList.map((code) => {
                return (
                  <tr key={code.code}>
                    <td>
                      <Button variant="link" onClick={() => handleMainCodeClick(code)}>
                        {code.name}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
        <Col sm={3}>
          <Table className="category">
            <tbody>
              {currentMainCode &&
                currentMainCode.subCodeList.map((code, index) => {
                  return (
                    <tr key={code.codeSeq}>
                      <td>{code.name}</td>
                      <td className="center">
                        {index > 0 && (
                          <Button variant="link" onClick={() => handleUpClick(code.codeSeq)}>
                            <FaArrowUp />
                          </Button>
                        )}
                        {index === 0 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                        {index < currentMainCode.subCodeList.length - 1 && (
                          <Button variant="link" onClick={() => handleDownClick(code.codeSeq)}>
                            <FaArrowDown />
                          </Button>
                        )}
                        {index === currentMainCode.subCodeList.length - 1 && <span style={{ padding: '0 7px' }}>&nbsp;</span>}
                      </td>
                      <td className="center">
                        <Button variant="link" onClick={() => handleEditCodeClick(code.codeSeq)}>
                          <CiEdit />
                        </Button>
                        <Button variant="link" onClick={() => handleDeleteCodeClick(code.codeSeq)}>
                          <AiOutlineDelete />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
          {currentMainCode && (
            <Button onClick={handleAddCodeClick} variant="outline-success" style={{ width: '100%' }}>
              추가
            </Button>
          )}
        </Col>
      </Row>
      <CodeModal ref={codeModalRef} />
    </>
  );
}

export default Code;
