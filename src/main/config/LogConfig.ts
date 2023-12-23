import log from 'electron-log';
import fs from 'fs';
import path from 'path';

// 최대 로그 파일 크기
const MAX_LOG_FILE_SIZE = 1024 * 1024; // 1 Megabytes

// 롤오버 확인 및 처리 함수
export default function checkLogFileSize() {
  const logFilePath = log.transports.file.getFile().path;
  console.log('logFilePath', logFilePath);
  const fileSize = fs.statSync(logFilePath).size;

  if (fileSize > MAX_LOG_FILE_SIZE) {
    const newLogFilePath = logFilePath.replace(/\.log$/, `-${Date.now()}.log`);
    fs.renameSync(logFilePath, newLogFilePath);
    log.info(`Log file rolled over to ${path.basename(newLogFilePath)}`);
  }
}
