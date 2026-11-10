import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';
import { apiRequest } from './api.js';
import { Quotation, formatDate } from './Quotation.jsx';
import { Topbar } from './Topbar.jsx';

export function QuotationView({ route, quotationId, notify }) {
  const [quotation, setQuotation] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    void loadQuotation();
  }, [quotationId]);

  async function loadQuotation() {
    try {
      setQuotation(await apiRequest(`/quotations/${quotationId}`));
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      notify(error.message, 'error');
    }
  }

  if (loadState !== 'ready') {
    return <>
      <Topbar route={route} />
      <main className="page">
        <div className="empty-state">
          {loadState === 'loading' ? <p>Loading quotation…</p> : <><h2>Quotation unavailable</h2><p>It may have been deleted, or the server could not be reached.</p><a className="button secondary" href="#/quotations">Back to quotation list</a></>}
        </div>
      </main>
    </>;
  }

  const party = { ...quotation.party, serial: quotation.serialNumber };

  return <>
    <Topbar route={route}>
      <a className="button ghost" href="#/quotations"><ArrowLeft size={16} /> All quotations</a>
      <a className="button secondary" href={`#/quotations/${quotation.id}/edit`}><Pencil size={16} /> Modify</a>
      <button className="button primary" onClick={() => window.print()}><Printer size={16} /> Print</button>
    </Topbar>

    <main className="page view-page">
      <div className="section-heading">
        <div><span className="eyebrow">QUOTATION NO. {quotation.serialNumber}</span><h1>{party.name || 'Untitled party'}</h1><p>Created {formatDate(quotation.createdAt)} · Last updated {formatDate(quotation.updatedAt)}</p></div>
      </div>
      <div className="paper-wrap view-paper"><Quotation company={quotation.company} party={party} rates={quotation.rates} issueDate={formatDate(quotation.createdAt)} /></div>
    </main>
  </>;
}
