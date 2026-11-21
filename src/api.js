// Every route lives under /api, so accept VITE_API_URL with or without it (and with a trailing slash).
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '').replace(/(\/api)?$/, '/api');

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    // fetch only rejects when the server is unreachable or the browser blocks the response (CORS).
    throw new Error(`Cannot reach the quotation server at ${API_URL}. Check that it is running and allows this site (CORS_ORIGIN).`);
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.error || 'Unable to connect to the quotation database.');
  return data;
}
