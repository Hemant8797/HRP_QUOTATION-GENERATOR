import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, X } from 'lucide-react';
import { useRoute } from './router.js';
import { QuotationEditor } from './QuotationEditor.jsx';
import { QuotationList } from './QuotationList.jsx';
import { QuotationView } from './QuotationView.jsx';
import './styles.css';

function App() {
  const route = useRoute();
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), toast.type === 'error' ? 5000 : 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name, route.id]);

  return <>
    {route.name === 'list' && <QuotationList route={route} notify={notify} />}
    {route.name === 'view' && <QuotationView key={route.id} route={route} quotationId={route.id} notify={notify} />}
    {(route.name === 'new' || route.name === 'edit') && <QuotationEditor key={route.id || 'new'} route={route} quotationId={route.id} notify={notify} />}
    {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />} {toast.message}</div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
