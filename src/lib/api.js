const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://parting-pro-backend.onrender.com';

export const api = {
  get: (path) => fetch(`${BASE}${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (path, body) => fetch(`${BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  del: (path) => fetch(`${BASE}${path}`, { method: 'DELETE' }).then(r => r.json()),
  uploadImage: async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const r = await fetch(`${BASE}/api/upload`, { method: 'POST', body: fd })
    return await r.json()
  },
};
