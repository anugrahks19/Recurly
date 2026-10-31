const base = import.meta.env.VITE_API_BASE_URL || '';

export async function authRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${base}/api/auth/${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the authentication server. Please try again later.');
  }
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (response.ok && !isJson && response.status !== 204) {
    throw new Error('Authentication server is not configured or returned an invalid response.');
  }
  const data = isJson ? await response.json().catch(() => ({})) : {};
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}
