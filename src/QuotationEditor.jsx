import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Printer, RotateCcw, Save, ChevronDown, MapPin, FileText, CheckCircle2, X, Eye } from 'lucide-react';
import { apiRequest } from './api.js';
import { Quotation, formatDate } from './Quotation.jsx';
import { Topbar } from './Topbar.jsx';

const defaultStations = ['Aurangabad', 'Dehri-on-Sone', 'Sasaram', 'Daudnagar', 'Nasriganj'];

// Used only when the API cannot be reached; the server keeps the real counter.
const FIRST_SERIAL = '101';

const starterCompany = {
  name: 'HRP Logistics',
  address: 'D/29, Transport Nagar, Patna-7',
  phone: '9934775079 · 8797328779',
  email: 'hrplogistics1@gmail.com',
  pan: '',
  gstin: '10CFEPS8006P1Z7',
};

const CARRIER_PAN_STORAGE_KEY = 'hrp-logistics-carrier-pan';

function getSavedCarrierPan() {
  try {
    return window.localStorage.getItem(CARRIER_PAN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

const clearedParty = {
  name: '',
  address: '',
  city: '',
  email: '',
  phone: '',
  tin: '',
  goods: '',
  billingType: '',
  bilty: '',
  minimumCharge: '',
  fov: '',
  afterRs: '',
  rrc: '',
  hamali: '',
  surcharge: '',
  ccDoor: '',
};

const clearedRates = defaultStations.map(station => [station, '', '', '', '', '', '']);

function Editable({ label, value, onChange, wide = false, hint }) {
  return <label className={`field ${wide ? 'wide' : ''}`}>
    <span>{label}</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={hint || `Enter ${label.toLowerCase()}`} />
  </label>;
}

function incrementSerial(serial) {
  const value = String(serial ?? '').trim();
  const match = value.match(/^(.*?)(\d+)$/);

  if (!match) return value;

  const [, prefix, numericPart] = match;
  const incremented = String(Number(numericPart) + 1);
  return `${prefix}${incremented.padStart(numericPart.length, '0')}`;
}

export function QuotationEditor({ route, quotationId, notify }) {
  const isEditing = Boolean(quotationId);
  const [company, setCompany] = useState(() => ({ ...starterCompany, pan: getSavedCarrierPan() }));
  const [party, setParty] = useState({ ...clearedParty, serial: '' });
  const [rates, setRates] = useState(isEditing ? [] : clearedRates);
  const [createdAt, setCreatedAt] = useState(null);
  const [loadState, setLoadState] = useState(isEditing ? 'loading' : 'ready');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(quotationId || null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const pendingSave = useRef(null);
  const saved = useRef({ id: quotationId || null, snapshot: null });
  const latest = useRef(null);

  // Only Print and Save store a quotation. "Unsaved" means edited since the last save, or since the blank form.
  const snapshot = JSON.stringify({ company, party, rates });
  const blankSnapshot = JSON.stringify({ company: { ...starterCompany, pan: company.pan }, party: { ...clearedParty, serial: party.serial }, rates: clearedRates });
  const hasUnsavedChanges = snapshot !== (savedSnapshot ?? blankSnapshot);
  // Saves finish after later renders, so they read the newest form state from here rather than a stale closure.
  latest.current = { company, party, rates, snapshot };

  function confirmDiscard() {
    return !hasUnsavedChanges || window.confirm('This quotation has unsaved changes. Discard them?');
  }

  function markSaved(id, savedState) {
    saved.current = { id, snapshot: savedState };
    setSavedId(id);
    setSavedSnapshot(savedState);
  }

  useEffect(() => {
    try {
      if (company.pan.trim()) {
        window.localStorage.setItem(CARRIER_PAN_STORAGE_KEY, company.pan.trim());
      } else {
        window.localStorage.removeItem(CARRIER_PAN_STORAGE_KEY);
      }
    } catch {
      // The form remains usable when browser storage is unavailable.
    }
  }, [company.pan]);

  useEffect(() => {
    if (isEditing) void loadQuotation();
    else void loadNextSerial();
  }, [quotationId]);

  useEffect(() => {
    const onLinkClick = event => {
      const link = event.target.closest?.('a[href^="#/"]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const target = link.getAttribute('href').slice(1);

      // "New quotation" while already on the new-quotation page would not change the URL, so start the next one here.
      if (target === '/new' && !isEditing) {
        event.preventDefault();
        if (savedId || hasUnsavedChanges) void resetForm();
        return;
      }
      if (!confirmDiscard()) event.preventDefault();
    };
    const onBeforeUnload = event => {
      if (hasUnsavedChanges) event.preventDefault();
    };

    document.addEventListener('click', onLinkClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('click', onLinkClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [snapshot, savedId, hasUnsavedChanges, isEditing]);

  const updateParty = key => value => setParty(current => ({ ...current, [key]: value }));
  const updateCompany = key => value => setCompany(current => ({ ...current, [key]: value }));
  const updateRate = (rowIndex, columnIndex, value) => setRates(current => current.map((row, i) => i === rowIndex ? row.map((cell, j) => j === columnIndex ? value : cell) : row));
  const addRate = () => setRates(current => [...current, ['', '', '0.00', '0.00', '0.00', '0.00', '0.00']]);
  const removeRate = index => setRates(current => current.filter((_, i) => i !== index));
  const issueDate = useMemo(() => formatDate(createdAt), [createdAt]);

  async function loadNextSerial() {
    let serialNumber = FIRST_SERIAL;
    try {
      ({ serialNumber } = await apiRequest('/quotations/next-serial'));
    } catch {
      // The entry screen remains usable if the API has not been configured yet.
    }
    // Never overwrite a serial the user has already typed.
    setParty(current => current.serial ? current : { ...current, serial: serialNumber });
  }

  async function resetForm() {
    if (!confirmDiscard()) return;

    const previousSerial = party.serial;
    const localSerial = incrementSerial(previousSerial || FIRST_SERIAL);
    setCompany(current => ({ ...starterCompany, pan: current.pan }));
    setParty({ ...clearedParty, serial: localSerial });
    setRates(clearedRates);
    markSaved(null, null);

    try {
      const { serialNumber } = await apiRequest('/quotations/next-serial/advance', { method: 'POST', body: JSON.stringify({ from: previousSerial }) });
      setParty(current => current.serial === localSerial ? { ...current, serial: serialNumber } : current);
    } catch {
      // Keep the locally incremented number if the counter could not be updated.
    }
  }

  async function loadQuotation() {
    try {
      const quotation = await apiRequest(`/quotations/${quotationId}`);
      const loaded = {
        company: { ...starterCompany, ...quotation.company, pan: quotation.company.pan || getSavedCarrierPan() },
        party: { ...clearedParty, ...quotation.party, serial: quotation.serialNumber },
        rates: quotation.rates,
      };
      setCompany(loaded.company);
      setParty(loaded.party);
      setRates(loaded.rates);
      markSaved(quotationId, JSON.stringify(loaded));
      setCreatedAt(quotation.createdAt);
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      notify(error.message, 'error');
    }
  }

  // Resolves to true once the form, as it is when this save starts, is stored. Saves run one at a time,
  // so a new quotation is never created twice and an edit made during a save is saved by the next one.
  async function saveQuotation() {
    while (pendingSave.current) await pendingSave.current;

    const { company, party, rates, snapshot } = latest.current;
    if (saved.current.id && snapshot === saved.current.snapshot) return true;

    const request = (async () => {
      const id = saved.current.id;
      setIsSaving(true);
      try {
        const savedQuotation = await apiRequest(id ? `/quotations/${id}` : '/quotations', {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify({ serialNumber: party.serial, company, party, rates }),
        });
        markSaved(savedQuotation.id, snapshot);
        notify(id ? 'Quotation changes saved' : `Quotation no. ${savedQuotation.serialNumber} saved`);
        return true;
      } catch (error) {
        notify(error.message, 'error');
        return false;
      } finally {
        setIsSaving(false);
      }
    })();
    pendingSave.current = request;
    try {
      return await request;
    } finally {
      if (pendingSave.current === request) pendingSave.current = null;
    }
  }

  async function printQuotation() {
    // Printing still goes ahead if the save fails; the error toast tells the user.
    if (hasUnsavedChanges) await saveQuotation();
    setShowPreview(true);
    setTimeout(() => window.print(), 250);
  }

  const saveStatus = isSaving ? 'Saving…' : hasUnsavedChanges ? 'Unsaved changes' : savedId ? `Saved · no. ${party.serial}` : 'New quotation';

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

  return <>
    <Topbar route={route}>
      <span className="autosave"><CheckCircle2 size={15} /> {saveStatus}</span>
      {isEditing
        ? <a className="button ghost" href={`#/quotations/${quotationId}`}><Eye size={16} /> View</a>
        : <button className="button ghost" onClick={resetForm}><RotateCcw size={16} /> Reset</button>}
      <button className="button secondary" onClick={() => void saveQuotation()} disabled={isSaving}><Save size={16} /> {isSaving ? 'Saving…' : savedId ? 'Save changes' : 'Save quotation'}</button>
      <button className="button primary editor-print" onClick={printQuotation}><Printer size={16} /> Print quotation</button>
    </Topbar>

    <main className="workspace">
      <section className="editor-panel">
        <div className="section-heading">
          {isEditing
            ? <div><span className="eyebrow">MODIFY DOCUMENT</span><h1>Edit quotation no. {party.serial}</h1><p>Update the details below and save your changes.</p></div>
            : <div><span className="eyebrow">NEW DOCUMENT</span><h1>Create party quotation</h1><p>Enter the party details and destination-wise freight rates.</p></div>}
          <button className="preview-link" onClick={() => setShowPreview(true)}><FileText size={16} /> View print layout</button>
        </div>

        <div className="form-card">
          <div className="card-title"><div className="icon-wrap teal"><MapPin size={18} /></div><div><h2>Carrier details</h2><p>Displayed at the top of the quotation.</p></div></div>
          <div className="form-grid company-grid">
            <Editable label="Carrier name" value={company.name} onChange={updateCompany('name')} />
            <Editable label="Phone" value={company.phone} onChange={updateCompany('phone')} />
            <Editable label="Registered address" value={company.address} onChange={updateCompany('address')} wide />
            <Editable label="Email" value={company.email} onChange={updateCompany('email')} />
            <Editable label="PAN number" value={company.pan} onChange={updateCompany('pan')} />
            <Editable label="GSTIN" value={company.gstin} onChange={updateCompany('gstin')} />
          </div>
        </div>

        <div className="form-card">
          <div className="card-title"><div className="icon-wrap amber"><FileText size={18} /></div><div><h2>Party & shipment details</h2><p>These details identify the company receiving the quotation.</p></div></div>
          <div className="form-grid">
            <Editable label="Serial no." value={party.serial} onChange={updateParty('serial')} />
            <Editable label="Party name" value={party.name} onChange={updateParty('name')} />
            <Editable label="Party address" value={party.address} onChange={updateParty('address')} wide />
            <Editable label="City" value={party.city} onChange={updateParty('city')} />
            <Editable label="Email" value={party.email} onChange={updateParty('email')} />
            <Editable label="Phone" value={party.phone} onChange={updateParty('phone')} />
            <Editable label="GSTIN / TIN" value={party.tin} onChange={updateParty('tin')} />
            <Editable label="Goods / item" value={party.goods} onChange={updateParty('goods')} />
            <label className="field"><span>Billing type</span><div className="select-wrap"><select value={party.billingType} onChange={e => updateParty('billingType')(e.target.value)}><option value="">Select billing type</option><option value="T">T — Transport</option><option value="F">F — Freight</option><option value="D">D — Door delivery</option></select><ChevronDown size={16} /></div></label>
          </div>
        </div>

        <div className="form-card charges-card">
          <div className="card-title"><div className="icon-wrap coral">₹</div><div><h2>Additional charges</h2><p>Set the standard charges that apply to this party.</p></div></div>
          <div className="charges-grid">
            {[['Bilty charge','bilty'], ['Minimum charge','minimumCharge'], ['F.O.V.','fov'], ['After R.S.','afterRs'], ['R.R.C.','rrc'], ['Hamali','hamali'], ['Surcharge','surcharge'], ['CC / door delivery','ccDoor']].map(([label, key]) => <Editable key={key} label={label} value={party[key]} onChange={updateParty(key)} />)}
          </div>
        </div>

        <div className="form-card rates-card">
          <div className="rates-header"><div className="card-title"><div className="icon-wrap violet"><MapPin size={18} /></div><div><h2>Rate information</h2><p>Add one row for each delivery station.</p></div></div><button className="button add" onClick={addRate}><Plus size={16} /> Add station</button></div>
          <div className="table-scroll"><table className="rate-table"><thead><tr><th>Station name</th><th>Item / goods</th><th>Charge / kg</th><th>Charge / case</th><th>Charge / T3</th><th>Charge / T4</th><th>Charge / T5</th><th></th></tr></thead><tbody>{rates.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><input aria-label={`row ${i + 1} field ${j + 1}`} value={cell} onChange={e => updateRate(i, j, e.target.value)} placeholder={j === 1 ? party.goods : ''} /></td>)}<td><button className="delete-row" onClick={() => removeRate(i)} aria-label="Remove station"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
        </div>
      </section>

      <aside className="preview-rail">
        <div className="preview-head"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Print-ready quotation</h2></div><button aria-label="Close preview" className="mobile-close" onClick={() => setShowPreview(false)}><X size={18}/></button></div>
        <div className="paper-wrap"><Quotation company={company} party={party} rates={rates} issueDate={issueDate} /></div>
        <p className="preview-note">A4 portrait · Updates as you type</p>
      </aside>
    </main>
    {showPreview && <div className="mobile-preview"><div className="mobile-overlay" onClick={() => setShowPreview(false)}></div><div className="mobile-paper"><button className="close-modal" onClick={() => setShowPreview(false)}><X size={20} /></button><Quotation company={company} party={party} rates={rates} issueDate={issueDate} /></div></div>}
  </>;
}
