import { BrowserWindow, Menu, dialog } from 'electron';
import moment from 'moment';
import { IPC_CHANNEL } from '../common/CommonType';
import { createWindow } from './main';
import SampleDataMakerService from './service/SampleDataMakerService';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    // const template = process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate();
    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildDefaultTemplate() {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    const submenu = [
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

    return [
      {
        label: '기능',
        submenu: [
          {
            label: '새창',
            accelerator: 'Ctrl+O',
            click: async () => {
              await createWindow(true);
            },
          },
          {
            label: '비밀번호 변경',
            click: () => {
              this.mainWindow.webContents.send(IPC_CHANNEL.PageChangePassword);
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
        submenu,
      },
    ];
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
