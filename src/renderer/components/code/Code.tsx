import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useCallback, useRef, useState } from 'react';
import CodeModal, { CodeModalHandle } from './CodeModal';
import { deleteConfirm } from '../util/util';
import { CodeMapping, getCodeList } from '../../mapper/CodeMapper';

function Code() {
  const [codeList, setCodeList] = useState(getCodeList());
  const [currentMainCode, setCurrentMainCode] = useState<CodeMapping | null>(null);
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

  function editCode(codeSeq: number) {
    if (!codeModalRef.current) {
      return;
    }

    codeModalRef.current?.openCodeModal(codeSeq, () => {
      console.log('edit');
    });
  }
  function changeMainCode(code: CodeMapping) {
    setCurrentMainCode(code);
  }

  function deleteCode(codeSeq: number) {
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
              {codeList.map((code) => {
                return (
                  <tr key={code.code}>
                    <td>
                      <Button variant="link" onClick={() => changeMainCode(code)}>
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
                currentMainCode.subCodeList.map((code) => {
                  return (
                    <tr key={code.codeSeq}>
                      <td>{code.name}</td>
                      <td className="center">
                        <Button variant="link" onClick={handleClick}>
                          <FaArrowUp />
                        </Button>
                        <Button variant="link" onClick={handleClick}>
                          <FaArrowDown />
                        </Button>
                      </td>
                      <td className="center">
                        <Button variant="link" onClick={() => editCode(code.codeSeq)}>
                          <CiEdit />
                        </Button>
                        <Button variant="link" onClick={() => deleteCode(code.codeSeq)}>
                          <AiOutlineDelete />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
          {currentMainCode && (
            <Button onClick={() => addCode()} variant="outline-success" style={{ width: '100%' }}>
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
