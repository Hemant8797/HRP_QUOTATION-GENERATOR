import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Trash2, Printer, RotateCcw, Save, ChevronDown, MapPin, Phone, Mail, FileText, CheckCircle2, X } from 'lucide-react';
import './styles.css';

const defaultRates = [
  ['Aurangabad', '', '1.50', '30.00', '0.00', '0.00', '0.00'],
  ['Dehri-on-Sone', '', '1.50', '30.00', '0.00', '0.00', '0.00'],
  ['Sasaram', '', '1.50', '30.00', '0.00', '0.00', '0.00'],
  ['Daudnagar', '', '0.00', '0.00', '0.00', '0.00', '0.00'],
  ['Nasriganj', '', '1.50', '30.00', '0.00', '0.00', '0.00'],
];

const starterCompany = {
  name: 'HRP Logistics',
  address: 'D/29, Transport Nagar, Patna-7',
  phone: '9934775079 · 8797328779',
  email: 'hrplogistics1@gmail.com',
  pan: '',
  gstin: '10CFEPS8006P1Z7',
};

const initialParty = {
  serial: '3246',
  name: 'Shanmukha Agaritec Limited',
  address: 'Mahadev Asthan, Begampur P.O. Marchi Road, P.S. Bypass',
  city: 'Patna',
  email: '',
  phone: '',
  tin: '10AAPCS8870E1Z6',
  goods: 'Pesticide',
  billingType: 'T',
  bilty: '30.00',
  minimumCharge: '0.00',
  fov: '0.00',
  afterRs: '0.00',
  rrc: '0.00',
  hamali: '2.00',
  surcharge: '0.00',
  ccDoor: '0.00',
};

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

const clearedRates = defaultRates.map(([station]) => [station, '', '', '', '', '', '']);

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

function App() {
  const [company, setCompany] = useState(starterCompany);
  const [party, setParty] = useState(initialParty);
  const [rates, setRates] = useState(defaultRates);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateParty = key => value => setParty(current => ({ ...current, [key]: value }));
  const updateCompany = key => value => setCompany(current => ({ ...current, [key]: value }));
  const updateRate = (rowIndex, columnIndex, value) => setRates(current => current.map((row, i) => i === rowIndex ? row.map((cell, j) => j === columnIndex ? value : cell) : row));
  const resetForm = () => {
    setCompany(current => ({ ...starterCompany, pan: current.pan }));
    setParty(current => ({ ...clearedParty, serial: incrementSerial(current.serial) }));
    setRates(clearedRates);
    setSaved(false);
  };
  const addRate = () => setRates(current => [...current, ['', '', '0.00', '0.00', '0.00', '0.00', '0.00']]);
  const removeRate = index => setRates(current => current.filter((_, i) => i !== index));
  const issueDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()), []);

  return <>
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">HL</div>
        <div><strong>HRP Logistics</strong><span>Transport contractor &amp; commission agents</span></div>
      </div>
      <div className="top-actions">
        <span className="autosave"><CheckCircle2 size={15} /> Draft saved locally</span>
        <button className="button ghost" onClick={resetForm}><RotateCcw size={16} /> Reset</button>
        <button className="button secondary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2400); }}><Save size={16} /> Save draft</button>
        <button className="button primary" onClick={() => { setShowPreview(true); setTimeout(() => window.print(), 250); }}><Printer size={16} /> Print quotation</button>
      </div>
    </header>

    <main className="workspace">
      <section className="editor-panel">
        <div className="section-heading">
          <div><span className="eyebrow">NEW DOCUMENT</span><h1>Create party quotation</h1><p>Enter the party details and destination-wise freight rates.</p></div>
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
    {saved && <div className="toast"><CheckCircle2 size={18} /> Draft saved successfully</div>}
    {showPreview && <div className="mobile-preview"><div className="mobile-overlay" onClick={() => setShowPreview(false)}></div><div className="mobile-paper"><button className="close-modal" onClick={() => setShowPreview(false)}><X size={20} /></button><Quotation company={company} party={party} rates={rates} issueDate={issueDate} /></div></div>}
  </>;
}

function Quotation({ company, party, rates, issueDate }) {
  const charges = [['Bilty Charge', party.bilty], ['Minimum Charge', party.minimumCharge], ['F.O.V.', party.fov], ['After R.S.', party.afterRs], ['R.R.C.', party.rrc], ['Hamali', party.hamali], ['Surcharge', party.surcharge], ['CC / Door Del.', party.ccDoor]];
  return <article className="quotation">
    <div className="quote-rule"></div>
    <div className="quote-kicker">PARTY RATE LIST</div>
    <h1>{company.name || 'Carrier Name'}</h1>
    <div className="company-strip"><span><MapPin size={11}/>{company.address || 'Registered address'}</span><span><Phone size={11}/>{company.phone || 'Phone'}</span>{company.email && <span><Mail size={11}/>{company.email}</span>}{company.pan && <span>PAN NO. {company.pan}</span>}<span>GSTIN: {company.gstin || '—'}</span></div>
    <div className="quote-meta"><div><b>Quotation no.</b><span>{party.serial || '—'}</span></div><div><b>Issue date</b><span>{issueDate}</span></div></div>
    <div className="quote-details"><div className="party-block"><div className="quote-label">PREPARED FOR</div><h2>{party.name || 'Party name'}</h2><p>{party.address || 'Party address'}</p><div className="contact-grid"><span><b>City</b>{party.city || '—'}</span><span><b>Phone</b>{party.phone || '—'}</span><span><b>Email</b>{party.email || '—'}</span><span><b>GSTIN / TIN</b>{party.tin || '—'}</span></div></div><div className="charge-block"><div className="quote-label">CHARGE DETAILS</div>{charges.map(([name, value]) => <div className="charge-line" key={name}><span>{name}</span><b>₹ {value || '0.00'}</b></div>)}<div className="goods-line"><span>Goods</span><b>{party.goods || '—'}</b></div><div className="goods-line"><span>Billing type</span><b>{party.billingType || '—'}</b></div></div></div>
    <div className="quote-table-wrap"><table className="quote-table"><thead><tr><th>Station name</th><th>Item / goods name</th><th>Charge / kg</th><th>Charge / Cs</th><th>Charge / T3</th><th>Charge / T4</th><th>Charge / T5</th></tr></thead><tbody>{rates.map((r,i) => <tr key={i}><td>{r[0] || '—'}</td><td>{r[1] || party.goods || '—'}</td>{r.slice(2).map((v,j) => <td key={j}>₹ {v || '0.00'}</td>)}</tr>)}</tbody></table></div>
    <div className="quote-footer"><p>Rates are subject to change as per carrier policy. Please quote the quotation number for all correspondence.</p><div><div className="signature-line"></div><b>Authorised signatory</b></div></div>
  </article>;
}

createRoot(document.getElementById('root')).render(<App />);
