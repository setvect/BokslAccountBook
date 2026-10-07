const fs = require('fs/promises');
const path = require('path');

// The bundled macOS 7-Zip normalizes its filename argument to NFD before scanning.
// Match the directory entry too; APFS lookup alone does not fix its byte comparison.
exports.default = async ({ electronPlatformName, appOutDir, packager }) => {
  if (electronPlatformName !== 'darwin') return;
  const name = `${packager.appInfo.productFilename}.app`;
  const normalized = name.normalize('NFD');
  if (name !== normalized) await fs.rename(path.join(appOutDir, name), path.join(appOutDir, normalized));
};
