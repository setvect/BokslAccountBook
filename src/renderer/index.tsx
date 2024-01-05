import { createRoot } from 'react-dom/client';
import App from './App';
import 'typeface-nanum-gothic';
import '@kfonts/nanum-square-round-otf';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import CodeMapper from './mapper/CodeMapper';
import AccountMapper from './mapper/AccountMapper';
import StockMapper from './mapper/StockMapper';
import StockBuyMapper from './mapper/StockBuyMapper';
import CategoryMapper from './mapper/CategoryMapper';
import FavoriteMapper from './mapper/FavoriteMapper';
import { IPC_CHANNEL } from '../common/CommonType';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

// 자주 쓰는 데이터 미리 로딩
CodeMapper.loadList();
AccountMapper.loadList();
StockMapper.loadList();
StockBuyMapper.loadBuyList();
CategoryMapper.loadList();
FavoriteMapper.loadList();

root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once(IPC_CHANNEL.ipcExample, (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage(IPC_CHANNEL.ipcExample, ['ping']);
