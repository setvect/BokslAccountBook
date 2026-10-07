import { createRoot } from 'react-dom/client';
import App from './App';
import 'typeface-nanum-gothic';
import '@kfonts/nanum-square-round-otf';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import { loadReferenceData } from './state/referenceData';

const container = document.getElementById('root');
if (!container) throw new Error('앱의 root 요소를 찾을 수 없습니다.');
const root = createRoot(container);
async function start() {
  try {
    await loadReferenceData();
    root.render(<App />);
  } catch {
    root.render(
      <div role="alert">
        초기 데이터를 불러오지 못했습니다.{' '}
        <button type="button" onClick={start}>
          다시 시도
        </button>
      </div>,
    );
  }
}
start();
