import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const normalizeMacBundle = require('../../.erb/scripts/normalize-mac-bundle').default;

const describeOnMac = process.platform === 'darwin' ? describe : describe.skip;

describeOnMac('macOS 한글 앱의 설치 경로', () => {
  let directory: string;
  const productName = '복슬가계부';
  const helperNames = [' Helper', ' Helper (GPU)', ' Helper (Renderer)', ' Helper (Plugin)'];

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'boksl-mac-bundle-'));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  async function createBundle(bundlePath: string, name: string) {
    const contentsPath = path.join(bundlePath, 'Contents');
    await fs.mkdir(path.join(contentsPath, 'MacOS'), { recursive: true });
    await fs.writeFile(path.join(contentsPath, 'MacOS', name), 'fixture executable');
    await fs.writeFile(
      path.join(contentsPath, 'Info.plist'),
      `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>CFBundleName</key><string>${name}</string>
<key>CFBundleExecutable</key><string>${name}</string>
<key>CFBundleDisplayName</key><string>${name}</string>
<key>CFBundleIdentifier</key><string>com.setvect.BokslAccountBook</string>
</dict></plist>`,
    );
  }

  function readField(bundlePath: string, field: string) {
    return execFileSync('/usr/libexec/PlistBuddy', ['-c', `Print :${field}`, path.join(bundlePath, 'Contents', 'Info.plist')], {
      encoding: 'utf8',
    }).trim();
  }

  it('Helper 실행 경로가 realpath와 바이트 단위로 일치하고 재처리해도 유지된다', async () => {
    const bundlePath = path.join(directory, `${productName}.app`);
    await createBundle(bundlePath, productName);
    await Promise.all(
      helperNames.map((suffix) =>
        createBundle(path.join(bundlePath, 'Contents', 'Frameworks', `${productName}${suffix}.app`), `${productName}${suffix}`),
      ),
    );
    const context = { electronPlatformName: 'darwin', appOutDir: directory, packager: { appInfo: { productFilename: productName } } };
    await normalizeMacBundle(context);
    await normalizeMacBundle(context);

    const installedBundle = await fs.realpath(path.join(directory, `${productName.normalize('NFD')}.app`));
    const name = readField(installedBundle, 'CFBundleName');
    expect(name).toBe('BokslAccountBook');
    const mainExecutable = path.join(installedBundle, 'Contents', 'MacOS', readField(installedBundle, 'CFBundleExecutable'));
    expect(await fs.realpath(mainExecutable)).toBe(mainExecutable);
    await Promise.all(
      helperNames.map(async (suffix) => {
        const helperPath = path.join(installedBundle, 'Contents', 'Frameworks', `${name}${suffix}.app`);
        const executable = path.join(helperPath, 'Contents', 'MacOS', readField(helperPath, 'CFBundleExecutable'));
        expect(await fs.realpath(executable)).toBe(executable);
        expect(readField(helperPath, 'CFBundleDisplayName')).toBe(`${productName}${suffix}`);
      }),
    );
    expect(readField(installedBundle, 'CFBundleDisplayName')).toBe(productName);
    expect(readField(installedBundle, 'CFBundleIdentifier')).toBe('com.setvect.BokslAccountBook');

    // ZIP 압축 해제 시 외부 앱 폴더가 NFC로 바뀌어도 Helper 이름은 동일하다.
    const zipBundlePath = path.join(directory, `${productName}.app`);
    await fs.rename(installedBundle, zipBundlePath);
    const zipBundle = await fs.realpath(zipBundlePath);
    const gpuHelper = path.join(zipBundle, 'Contents', 'Frameworks', `${name} Helper (GPU).app`);
    const gpuExecutable = path.join(gpuHelper, 'Contents', 'MacOS', readField(gpuHelper, 'CFBundleExecutable'));
    expect(await fs.realpath(gpuExecutable)).toBe(gpuExecutable);
  });

  it('다른 플랫폼에서는 파일을 변경하지 않는다', async () => {
    const bundlePath = path.join(directory, `${productName}.app`);
    await createBundle(bundlePath, productName);
    await normalizeMacBundle({ electronPlatformName: 'win32', appOutDir: directory, packager: { appInfo: { productFilename: productName } } });
    expect(await fs.readdir(directory)).toEqual([`${productName}.app`]);
    expect(readField(bundlePath, 'CFBundleName')).toBe(productName);
  });
});
