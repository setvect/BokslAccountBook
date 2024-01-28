/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, dialog, screen, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log, { FileTransport } from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import checkLogFileSize from './config/LogConfig';
import { initConnection } from './config/AppDataSource';
import IpcHandler from './IpcHandler';
import DbInitService from './service/DbInitService';
import StoreService from './service/StoreService';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

IpcHandler.registerHandlers();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch((error: Error) => {
      console.log('Error occurred:', error);
    });
};

/**
 * 윈도우 화면 사이즈 조정
 */
function getAdjustedWindowBounds(newWindow: boolean) {
  const defaultBounds = { x: 0, y: 0, width: 1800, height: 1000 };

  const windowBounds = StoreService.getWindowBounds();

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: maxWidth, height: maxHeight } = primaryDisplay.workAreaSize;

  // 화면 밖으로 나가는지 확인하고 조정
  if (
    windowBounds.x < 0 ||
    windowBounds.y < 0 ||
    windowBounds.x + windowBounds.width > maxWidth ||
    windowBounds.y + windowBounds.height > maxHeight
  ) {
    windowBounds.x = defaultBounds.x;
    windowBounds.y = defaultBounds.y;
    windowBounds.width = defaultBounds.width;
    windowBounds.height = defaultBounds.height;
  }
  if (newWindow) {
    windowBounds.x += 30;
    windowBounds.y += 30;
  }
  return windowBounds;
}

// eslint-disable-next-line import/prefer-default-export
export const createWindow = async (newWindow: boolean = false) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const windowBounds = getAdjustedWindowBounds(newWindow);

  const mainWindow = new BrowserWindow({
    show: false,
    x: windowBounds.x,
    y: windowBounds.y,
    width: windowBounds.width,
    height: windowBounds.height,
    icon: getAssetPath('icons/boksl-512.png'),
    webPreferences: {
      preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html')).catch((e: any) => {
    console.error('mainWindow loadURL error', e);
    log.error('mainWindow loadURL error', e);
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });

  mainWindow.on('resize', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    const { x, y, width, height } = mainWindow.getBounds();
    StoreService.saveWindowBounds({ x, y, width, height });
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

interface CustomFileTransport extends FileTransport {
  onLog?: (message: string) => void;
}

app
  .whenReady()
  .then(async () => {
    const customFileTransport = log.transports.file as CustomFileTransport;
    customFileTransport.onLog = checkLogFileSize;
    await initConnection();
    await DbInitService.initDbData();

    await createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      createWindow();
    });
  })
  .catch((error: any) => {
    console.error('error', error);
    log.error('error:', error);
    dialog
      .showMessageBox({
        type: 'error',
        title: '애플리케이션 오류',
        message: '애플리케이션이 시작되지 못했습니다.',
        detail: `오류 세부 정보: ${error.message || error.toString()}`,
        buttons: ['확인'],
      })
      // eslint-disable-next-line promise/no-nesting
      .then(() => {
        log.info('프로그램 종료');
        app.quit();
      })
      // eslint-disable-next-line promise/no-nesting
      .catch((error) => {
        log.error('dialog.showMessageBox error:', error);
      });
  });
