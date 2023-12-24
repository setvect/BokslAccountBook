import { BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
import { IPC_CHANNEL } from '../common/CommonType';
import UserService from './service/UserService';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    // const template = process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate();
    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDefaultTemplate() {
    return [
      {
        label: '기능',
        submenu: [
          {
            label: '새창',
            accelerator: 'Ctrl+O',
          },
          {
            label: '비밀번호 변경',
            click: () => {
              this.mainWindow.webContents.send(IPC_CHANNEL.change_password);
            },
          },
          {
            label: '닫기',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '보기',
        submenu: [
          {
            label: '새로고침',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: '전체화면',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
          {
            label: '디버깅 모드',
            accelerator: 'Alt+Ctrl+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: '복슬가계부',
        submenu: [
          {
            label: '복슬가계부에 대하여...',
            click: () => {
              UserService.createUser();
              UserService.findUser();
              this.mainWindow.webContents.send(IPC_CHANNEL.about_boksl);
            },
          },
        ],
      },
    ];
  }
}
