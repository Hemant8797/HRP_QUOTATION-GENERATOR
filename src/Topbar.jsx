import React from 'react';
import { FilePlus2, List } from 'lucide-react';

export function Topbar({ route, children }) {
  const isListSection = route.name !== 'new';
  return <header className="topbar">
    <div className="brand">
      <div className="brand-mark">HL</div>
      <div><strong>HRP Logistics</strong><span>Transport contractor &amp; commission agents</span></div>
    </div>
    <nav className="main-nav" aria-label="Main">
      <a href="#/new" className={isListSection ? '' : 'active'}><FilePlus2 size={15} /> New quotation</a>
      <a href="#/quotations" className={isListSection ? 'active' : ''}><List size={15} /> Quotation list</a>
    </nav>
    <div className="top-actions">{children}</div>
  </header>;
}
