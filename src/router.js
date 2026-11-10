import { useEffect, useState } from 'react';

// Routes: #/new · #/quotations · #/quotations/:id · #/quotations/:id/edit
export function parseRoute(hash) {
  const [section, id, action] = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  if (section === 'quotations' && id) return { name: action === 'edit' ? 'edit' : 'view', id };
  if (section === 'quotations') return { name: 'list' };
  return { name: 'new' };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function navigate(path, { replace = false } = {}) {
  if (replace) window.location.replace(`#${path}`);
  else window.location.hash = path;
}
