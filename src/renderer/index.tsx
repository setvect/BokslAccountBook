import { createRoot } from 'react-dom/client';
import App from './App';
import 'typeface-nanum-gothic';
import '@kfonts/nanum-square-round-otf';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import { loadCodeMapping } from './components/common/CodeMapper';
import { loadAccountList } from './components/common/AccountMapper';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

// 글로벌 변수 불러오기
loadCodeMapping();
loadAccountList();

root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
