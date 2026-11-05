import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import CompanyOffice from './components/CompanyOffice';
import './index.css';

// The company workspace is an isolated preview route; the consumer app remains unchanged.
const isCompanyOffice = window.location.pathname.startsWith('/company');
createRoot(document.getElementById('root')!).render(
  isCompanyOffice ? <CompanyOffice /> : <App />
);
