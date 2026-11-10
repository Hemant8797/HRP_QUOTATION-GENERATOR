import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(value ? new Date(value) : new Date());
}

export function Quotation({ company, party, rates, issueDate }) {
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
