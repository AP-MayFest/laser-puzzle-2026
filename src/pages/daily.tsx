import './daily.css';

import {createRoot} from 'react-dom/client';
import {DailyApp} from '../daily/app.tsx';
import { Provider } from 'jotai';

const root = document.getElementById('root');
if (root == null) {
    throw new Error('#root is required');
}

createRoot(root).render(<Provider><DailyApp /></Provider>);
