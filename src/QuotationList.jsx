import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { apiRequest } from './api.js';
import { navigate } from './router.js';
import { formatDate } from './Quotation.jsx';
import { Topbar } from './Topbar.jsx';

export function QuotationList({ route, notify }) {
  const [quotations, setQuotations] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [search, setSearch] = useState('');

  useEffect(() => {
    void loadQuotations();
  }, []);

  async function loadQuotations() {
    try {
      setQuotations(await apiRequest('/quotations'));
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      notify(error.message, 'error');
    }
  }

  async function deleteQuotation(quotation) {
    if (!window.confirm(`Delete quotation no. ${quotation.serialNumber} for ${quotation.partyName}? This cannot be undone.`)) return;

    try {
      await apiRequest(`/quotations/${quotation.id}`, { method: 'DELETE' });
      setQuotations(current => current.filter(item => item.id !== quotation.id));
      notify(`Quotation no. ${quotation.serialNumber} deleted`);
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  const visibleQuotations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return quotations;
    return quotations.filter(quotation => [quotation.serialNumber, quotation.partyName, quotation.city, quotation.goods].some(value => value?.toLowerCase().includes(term)));
  }, [quotations, search]);

  return <>
    <Topbar route={route}>
      <a className="button primary" href="#/new"><Plus size={16} /> New quotation</a>
    </Topbar>

    <main className="page">
      <div className="section-heading">
        <div><span className="eyebrow">ALL DOCUMENTS</span><h1>Quotation list</h1><p>{loadState === 'ready' ? `${quotations.length} quotation${quotations.length === 1 ? '' : 's'} saved. Open one to print or modify it.` : 'Every quotation saved to the database.'}</p></div>
        <label className="search-field"><Search size={16} /><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by number, party, city or goods" aria-label="Search quotations" /></label>
      </div>

      <div className="form-card list-card">
        {loadState === 'loading' && <div className="empty-state"><p>Loading quotations…</p></div>}
        {loadState === 'error' && <div className="empty-state"><h2>Couldn’t load quotations</h2><p>Check that the API server is running and connected to MongoDB.</p><button className="button secondary" onClick={() => { setLoadState('loading'); void loadQuotations(); }}>Try again</button></div>}
        {loadState === 'ready' && !quotations.length && <div className="empty-state"><h2>No quotations yet</h2><p>Saved quotations will appear here.</p><a className="button primary" href="#/new"><Plus size={16} /> Create the first quotation</a></div>}
        {loadState === 'ready' && quotations.length > 0 && !visibleQuotations.length && <div className="empty-state"><p>No quotations match “{search}”.</p></div>}
        {loadState === 'ready' && visibleQuotations.length > 0 && <div className="table-scroll"><table className="list-table">
          <thead><tr><th>Quotation no.</th><th>Party</th><th>City</th><th>Goods</th><th>Stations</th><th>Created</th><th>Last updated</th><th aria-label="Actions"></th></tr></thead>
          <tbody>{visibleQuotations.map(quotation => <tr key={quotation.id} onClick={() => navigate(`/quotations/${quotation.id}`)}>
            <td className="serial-cell">{quotation.serialNumber}</td>
            <td className="party-cell">{quotation.partyName}</td>
            <td>{quotation.city || '—'}</td>
            <td>{quotation.goods || '—'}</td>
            <td>{quotation.stationCount}</td>
            <td>{formatDate(quotation.createdAt)}</td>
            <td>{formatDate(quotation.updatedAt)}</td>
            <td><div className="row-actions" onClick={event => event.stopPropagation()}>
              <a className="icon-button" href={`#/quotations/${quotation.id}`} title="Open" aria-label={`Open quotation ${quotation.serialNumber}`}><Eye size={16} /></a>
              <a className="icon-button" href={`#/quotations/${quotation.id}/edit`} title="Modify" aria-label={`Modify quotation ${quotation.serialNumber}`}><Pencil size={16} /></a>
              <button className="icon-button danger" onClick={() => deleteQuotation(quotation)} title="Delete" aria-label={`Delete quotation ${quotation.serialNumber}`}><Trash2 size={16} /></button>
            </div></td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </main>
  </>;
}
