const { spawnSync } = require('child_process');
const path = require('path');

const MIN_NODE_GYP_MAJOR_FOR_PYTHON_312 = 10;

function exitWithMessage(message) {
  console.error(`\n[install check] ${message}\n`);
  process.exit(1);
}

function getNodeGypInfo() {
  const projectRoot = path.resolve(__dirname, '../..');

  try {
    const electronRebuildPackagePath = require.resolve('electron-rebuild/package.json', {
      paths: [projectRoot],
    });
    const electronRebuildPath = path.dirname(electronRebuildPackagePath);
    const packageJsonPath = require.resolve('node-gyp/package.json', {
      paths: [electronRebuildPath, projectRoot],
    });
    const { version } = require(packageJsonPath);

    return {
      packageJsonPath,
      version,
    };
  } catch (error) {
    // Fall back to the project root node-gyp resolution.
  }

  try {
    const packageJsonPath = require.resolve('node-gyp/package.json', {
      paths: [projectRoot],
    });
    const { version } = require(packageJsonPath);

    return {
      packageJsonPath,
      version,
    };
  } catch (error) {
    return null;
  }
}

function getPythonInfo() {
  const candidates = Array.from(
    new Set([process.env.NODE_GYP_FORCE_PYTHON, process.env.PYTHON, process.env.npm_config_python, 'python3', 'python'].filter(Boolean)),
  );

  return candidates.reduce((found, candidate) => {
    if (found) {
      return found;
    }

    const result = spawnSync(candidate, ['-c', 'import sys; print(sys.version_info[0]); print(sys.version_info[1]); print(sys.executable)'], {
      encoding: 'utf8',
    });

    if (result.status !== 0) {
      return found;
    }

    const [major, minor, executable] = result.stdout.trim().split(/\r?\n/);

    return {
      candidate,
      executable: executable || candidate,
      major: Number(major),
      minor: Number(minor),
    };
  }, null);
}

const pythonInfo = getPythonInfo();

if (!pythonInfo) {
  exitWithMessage('Python executable not found. Native Electron dependencies require Python during install and rebuild.');
}

const nodeGypInfo = getNodeGypInfo();

if (!nodeGypInfo) {
  process.exit(0);
}

const nodeGypMajor = Number(nodeGypInfo.version.split('.')[0]);

if (pythonInfo.major === 3 && pythonInfo.minor >= 12 && nodeGypMajor < MIN_NODE_GYP_MAJOR_FOR_PYTHON_312) {
  exitWithMessage(
    `Python ${pythonInfo.major}.${pythonInfo.minor} is installed at ${pythonInfo.executable}, but this dependency tree resolved node-gyp ${nodeGypInfo.version}. Python 3.12+ requires node-gyp >= 10. Update dependencies or use Python 3.11 temporarily.`,
  );
}
