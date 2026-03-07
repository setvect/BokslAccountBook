const { spawn } = require('child_process');
const path = require('path');
const electronBinary = require('electron');

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
