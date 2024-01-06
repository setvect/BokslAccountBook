import { Button, Col, Row, Table } from 'react-bootstrap';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { AiOutlineDelete } from 'react-icons/ai';
import { useRef, useState } from 'react';
import CodeModal, { CodeModalHandle } from './CodeModal';
import { showDeleteDialog } from '../util/util';
import CodeMapper from '../../mapper/CodeMapper';
import { ResCodeModel, ResCodeValueModel } from '../../../common/ResModel';
import IpcCaller from '../../common/IpcCaller';

function CodeList() {
  const [codeList, setCodeList] = useState(CodeMapper.getList());
  const [currentMainCode, setCurrentMainCode] = useState<ResCodeModel | null>(null);
  const codeModalRef = useRef<CodeModalHandle>(null);

  async function reloadCode() {
    await CodeMapper.loadList();
    const reloadCodeList = CodeMapper.getList();
    setCodeList(reloadCodeList);

    const currentMain = reloadCodeList.find((item) => item.code === currentMainCode?.code);
    if (currentMain) {
      setCurrentMainCode(currentMain);
    }
  }

  const updateOrderCode = async (firstItem: ResCodeValueModel, secondItem: ResCodeValueModel) => {
    await IpcCaller.updateCodeOrder([
      { codeItemSeq: firstItem.codeSeq, orderNo: secondItem.orderNo },
      { codeItemSeq: secondItem.codeSeq, orderNo: firstItem.orderNo },
    ]);

    await reloadCode();
  };

  const changeOrder = async (categorySeq: number, direction: 'up' | 'down') => {
    if (!currentMainCode) {
      return;
    }
    const index = currentMainCode.subCodeList.findIndex((code) => code.codeSeq === categorySeq);
    if (index === -1) {
      return;
    }

    const swapIndex = direction === 'down' ? index + 1 : index - 1;
    if (swapIndex < 0 || swapIndex >= currentMainCode.subCodeList.length) {
      // 범위를 벗어나는 경우
      return;
    }

    await updateOrderCode(currentMainCode.subCodeList[index], currentMainCode.subCodeList[swapIndex]);
  };

  const handleDownClick = async (categorySeq: number) => {
    await changeOrder(categorySeq, 'down');
  };

  const handleUpClick = async (categorySeq: number) => {
    await changeOrder(categorySeq, 'up');
  };

  const handleAddCodeClick = () => {
    if (!codeModalRef.current || currentMainCode === null) {
      return;
    }

    codeModalRef.current?.openCodeModal(0, currentMainCode.code);
  };

  const handleEditCodeClick = (codeSeq: number) => {
    if (!codeModalRef.current || currentMainCode === null) {
      return;
    }

    codeModalRef.current?.openCodeModal(codeSeq, currentMainCode.code);
  };

  const handleMainCodeClick = (code: ResCodeModel) => {
    setCurrentMainCode(code);
  };

  const handleDeleteCodeClick = (codeSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteCode(codeSeq);
      await reloadCode();
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
      <CodeModal ref={codeModalRef} onSubmit={() => reloadCode()} />
    </>
  );
}

export default CodeList;
