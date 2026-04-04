import { BrowserWindow, dialog, Menu, MenuItemConstructorOptions } from 'electron';
import moment from 'moment';
import { IPC_CHANNEL } from '../common/CommonType';
import SampleDataMakerService from './service/SampleDataMakerService';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  onCreateWindow: (newWindow?: boolean) => Promise<void>;

  constructor(mainWindow: BrowserWindow, onCreateWindow: (newWindow?: boolean) => Promise<void>) {
    this.mainWindow = mainWindow;
    this.onCreateWindow = onCreateWindow;
  }

  buildMenu(): Menu {
    const template = process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildDefaultTemplate() {
    return [this.buildFeatureMenu(), this.buildViewMenu(), this.buildAppMenu()];
  }

  buildDarwinTemplate() {
    return [this.buildAppMenu(true), this.buildEditMenu(), this.buildFeatureMenu(), this.buildViewMenu()];
  }

  private buildEditMenu(): MenuItemConstructorOptions {
    return {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'cut', label: '오려두기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
        { role: 'selectAll', label: '전체 선택' },
      ],
    };
  }

  private buildFeatureMenu(): MenuItemConstructorOptions {
    return {
      label: '기능',
      submenu: [
        {
          label: '새창',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await this.onCreateWindow(true);
          },
        },
        {
          label: '비밀번호 변경',
          click: () => {
            this.mainWindow.webContents.send(IPC_CHANNEL.PageChangePassword);
          },
        },
        {
          label: '찾기',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            this.mainWindow.webContents.send(IPC_CHANNEL.FindOpen);
          },
        },
        {
          label: '닫기',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            this.mainWindow.close();
          },
        },
      ],
    };
  }

  private buildViewMenu(): MenuItemConstructorOptions {
    return {
      label: '보기',
      submenu: [
        {
          label: '새로고침',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: '전체화면',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: '디버깅 모드',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
  }

  private buildAppMenu(includeMacRoles: boolean = false): MenuItemConstructorOptions {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    const submenu: MenuItemConstructorOptions[] = [
      {
        label: '복슬가계부에 대하여...',
        click: () => {
          this.mainWindow.webContents.send(IPC_CHANNEL.PageAboutBoksl);
        },
      },
    ];

    if (isDevelopmentMode) {
      submenu.push({
        label: '샘플 데이터 만들기',
        click: async () => {
          await this.makeSampleData();
        },
      });
    }

    if (includeMacRoles) {
      submenu.push(
        { type: 'separator' },
        { role: 'hide', label: '복슬가계부 숨기기' },
        { role: 'hideOthers', label: '다른 앱 숨기기' },
        { role: 'unhide', label: '모두 보기' },
        { type: 'separator' },
        { role: 'quit', label: '복슬가계부 종료' },
      );
    }

    return {
      label: '복슬가계부',
      submenu,
    };
  }

  private async makeSampleData() {
    const currentDate = moment().format('YYYYMMDD_HHmmss');
    const backupFilePath = `db/BokslAccountBook_${currentDate}.db`;
    const response = dialog.showMessageBoxSync(this.mainWindow, {
      type: 'question',
      buttons: ['취소', '예. 샘플데이터를 만듭니다.'],
      defaultId: 2,
      title: '샘플데이터 만들기',
      message: `현재 데이터를 백업하고 샘플데이터를 만들까요?\n\n백업파일명: ${backupFilePath}\n\n그리고 현재 DB에 모든 데이터는 삭제되고 샘플데이터로 교체됩니다.`,
    });

    if (response === 1) {
      await SampleDataMakerService.makeSampleData(backupFilePath);
    }
  }
}
