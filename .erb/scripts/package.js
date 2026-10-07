const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const builder = require.resolve('electron-builder/cli.js');
function run(args) {
  const result = spawnSync(process.execPath, [builder, ...args], { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error);
  return result.status ?? 1;
}

// Packaging multiple architectures changes release/app's native binaries.
// Restore this machine's architecture even when packaging fails.
const packageStatus = run(['build', '--publish', 'never', ...process.argv.slice(2)]);
const restoreStatus = run(['install-app-deps', '--arch', process.arch]);
process.exitCode = packageStatus || restoreStatus;
