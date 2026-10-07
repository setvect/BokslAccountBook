const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const electronBinary = require('electron');

if (!fs.existsSync(electronBinary)) {
  console.error('Electron 실행 파일이 없습니다. node node_modules/electron/install.js 실행 후 npm start를 다시 실행하세요.');
  process.exit(1);
}

const appPath = path.resolve(__dirname, '../../release/app');

const env = { ...process.env, NODE_ENV: 'development' };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, [appPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
