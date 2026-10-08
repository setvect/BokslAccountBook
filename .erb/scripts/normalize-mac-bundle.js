const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const run = promisify(execFile);
const executableName = 'BokslAccountBook';

async function setPlistField(plistPath, field, newValue) {
  const { stdout } = await run('/usr/libexec/PlistBuddy', ['-c', `Print :${field}`, plistPath]);
  const value = stdout.trim();
  if (value !== newValue) {
    await run('/usr/libexec/PlistBuddy', ['-c', `Set :${field} ${newValue}`, plistPath]);
  }
  return value;
}

async function prepareBundle(bundlePath, internalName, bundleName) {
  const contentsPath = path.join(bundlePath, 'Contents');
  const plistPath = path.join(contentsPath, 'Info.plist');
  // Electron builds Helper paths from CFBundleName and compares them with realpath.
  // ASCII internal names survive both DMG installation and ZIP normalization.
  // CFBundleDisplayName stays Korean, as do the outer .app name and app ID.
  await setPlistField(plistPath, 'CFBundleName', internalName);
  const oldExecutable = await setPlistField(plistPath, 'CFBundleExecutable', internalName);
  if (oldExecutable !== internalName) {
    await fs.rename(path.join(contentsPath, 'MacOS', oldExecutable), path.join(contentsPath, 'MacOS', internalName));
  }

  const targetPath = path.join(path.dirname(bundlePath), bundleName);
  if (bundlePath !== targetPath) await fs.rename(bundlePath, targetPath);
}

async function prepareHelpers(directory, productFilename) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name.endsWith('.app'))
      .map((entry) => {
        const name = entry.name.normalize('NFC');
        const product = productFilename.normalize('NFC');
        const prefix = name.startsWith(`${product} `) ? product : executableName;
        if (!name.startsWith(`${prefix} `)) return undefined;
        const internalName = `${executableName}${name.slice(prefix.length, -4)}`;
        return prepareBundle(path.join(directory, entry.name), internalName, `${internalName}.app`);
      }),
  );
}

// The bundled macOS 7-Zip normalizes its filename argument to NFD before scanning.
// Keep the outer directory NFD for that scan; set internal names before signing.
exports.default = async ({ electronPlatformName, appOutDir, packager }) => {
  if (electronPlatformName !== 'darwin') return;
  const { productFilename } = packager.appInfo;
  const bundlePath = path.join(appOutDir, `${productFilename}.app`);
  await prepareHelpers(path.join(bundlePath, 'Contents', 'Frameworks'), productFilename);
  await prepareHelpers(path.join(bundlePath, 'Contents', 'Library', 'LoginItems'), productFilename);
  await prepareBundle(bundlePath, executableName, `${productFilename.normalize('NFD')}.app`);
};
