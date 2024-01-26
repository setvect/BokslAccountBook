import React, { useEffect, useRef, useState } from 'react';
import IpcCaller from '../../common/IpcCaller';

interface FindBoxProps {
  isVisible: boolean;
  onHide: () => void;
}

const FindBox: React.FC<FindBoxProps> = ({ isVisible, onHide }) => {
  const [findText, setFindText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null); // 입력 필드 참조 생성

  const handleFind = async () => {
    await IpcCaller.findDocument(findText);
  };

  const clear = async () => {
    setFindText('');
    await IpcCaller.findDocument('');
    onHide();
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="find-box">
      <input
        type="text"
        ref={inputRef}
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            await handleFind();
          }
        }}
        placeholder="검색어 입력"
      />
      <button onClick={() => clear()}>X</button>
    </div>
  );
};

export default FindBox;
