'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

function Thumb({ url }) {
  // Only show real URLs (Cloudinary etc). Seeded paths like "/caskets/oak.jpg"
  // don't exist on the Next frontend and cause noisy 404s.
  if (!url || !/^https?:\/\//i.test(String(url))) return <span style={{ color: '#9ca3af' }}>—</span>
  return (
    <img
      src={url}
      alt=""
      style={{ width: 44, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }}
      onError={(e) => { e.currentTarget.src = 'https://placehold.co/44x32/f3f4f6/9ca3af?text=?' }}
    />
  )
}

function ImageUpload({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')

  const pick = async (file) => {
    if (!file) return
    setErr('')
    setUploading(true)
    try {
      const r = await api.uploadImage(file)
      if (r?.url) onChange(r.url)
      else setErr(r?.error || 'Upload failed')
    } catch (e) {
      setErr('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Thumb url={value} />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, width: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: '#fff',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 12,
            color: '#374151',
            width: 130,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => pick(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={() => onChange('')}
          type="button"
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12 }}
        >
          Clear
        </button>
        {err && <span style={{ fontSize: 12, color: '#b91c1c' }}>{err}</span>}
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 520, maxWidth: 680, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Inp({ label, value, onChange, type = 'text', as }) {
  const style = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, width: '100%' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      {as === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...style, resize: 'vertical' }}/>
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style}/>
      }
    </div>
  )
}

function ProductTable({ data, columns, onEdit, onDelete }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          {columns.map(c => <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151' }}>{c.label}</th>)}
          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row._id || row.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
            {columns.map(c => (
              <td key={c.key} style={{ padding: '10px 14px', color: '#374151' }}>
                {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
              </td>
            ))}
            <td style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onEdit(row)} style={{ padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onDelete(row._id || row.id)} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No items found</td></tr>}
      </tbody>
    </table>
  )
}

// ─── PACKAGES SECTION ─────────────────────────────────────────────────────
function PackagesSection() {
  const [packages, setPackages] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState({ name: '', category: 'cremation', price: '', description: '', includes: '', image: '' })

  const load = () => api.get('/api/packages').then(setPackages)
  useEffect(() => { load() }, [])

  const upd = (k, v) => setForm(f => ({...f, [k]: v}))

  const openAdd = () => { setForm({ name: '', category: 'cremation', price: '', description: '', includes: '', image: '' }); setModal('add') }
  const openEdit = (pkg) => { setForm({ ...pkg, id: pkg._id || pkg.id, includes: pkg.includes?.join('\n') || '', price: String(pkg.price), image: pkg.image || '' }); setModal('edit') }

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price), includes: form.includes.split('\n').filter(Boolean) }
    if (modal === 'add') await api.post('/api/packages', body)
    else await api.put(`/api/packages/${form.id}`, body)
    setModal(null); load()
  }

  const handleDelete = async (id) => { if (confirm('Delete?')) { await api.del(`/api/packages/${id}`); load() } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Service Packages</h2>
        <button onClick={openAdd} style={{ padding: '8px 16px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>+ Add Package</button>
      </div>
      <ProductTable data={packages} onEdit={openEdit} onDelete={handleDelete} columns={[
        { key: 'image', label: 'Image', render: v => <Thumb url={v}/> },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category', render: v => <span style={{ background: v === 'cremation' ? '#fef3c7' : '#dbeafe', color: v === 'cremation' ? '#92400e' : '#1e40af', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{v}</span> },
        { key: 'price', label: 'Price', render: v => `$${Number(v).toLocaleString()}` },
        { key: 'description', label: 'Description', render: v => <span style={{ color: '#6b7280', fontSize: 12 }}>{v?.slice(0,60)}{v?.length > 60 ? '...' : ''}</span> },
      ]}/>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Package' : 'Edit Package'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Package Name" value={form.name} onChange={v => upd('name', v)}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Category</label>
                <select value={form.category} onChange={e => upd('category', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option value="cremation">Cremation</option>
                  <option value="burial">Burial</option>
                </select>
              </div>
              <Inp label="Starting Price ($)" type="number" value={form.price} onChange={v => upd('price', v)}/>
            </div>
            <Inp label="Description" value={form.description} onChange={v => upd('description', v)} as="textarea"/>
            <Inp label="Includes (one per line)" value={form.includes} onChange={v => upd('includes', v)} as="textarea"/>
            <ImageUpload label="Package Image" value={form.image} onChange={v => upd('image', v)}/>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── CASKETS SECTION ──────────────────────────────────────────────────────
function CasketsSection() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', material: '', interior: '', image: '' })

  const load = () => api.get('/api/caskets').then(setItems)
  useEffect(() => { load() }, [])
  const upd = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price) }
    if (modal === 'add') await api.post('/api/caskets', body)
    else await api.put(`/api/caskets/${form.id}`, body)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if (confirm('Delete?')) { await api.del(`/api/caskets/${id}`); load() } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Caskets</h2>
        <button onClick={() => { setForm({ name: '', price: '', material: '', interior: '', image: '' }); setModal('add') }} style={{ padding: '8px 16px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>+ Add Casket</button>
      </div>
      <ProductTable data={items} onEdit={r => { setForm({ ...r, id: r._id || r.id, price: String(r.price), image: r.image || '' }); setModal('edit') }} onDelete={handleDelete} columns={[
        { key: 'image', label: 'Image', render: v => <Thumb url={v}/> },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price', render: v => `$${Number(v).toLocaleString()}` },
        { key: 'material', label: 'Material' },
        { key: 'interior', label: 'Interior' },
      ]}/>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} Casket`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Name" value={form.name} onChange={v => upd('name', v)}/>
            <Inp label="Price ($)" type="number" value={form.price} onChange={v => upd('price', v)}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Material" value={form.material} onChange={v => upd('material', v)}/>
              <Inp label="Interior" value={form.interior} onChange={v => upd('interior', v)}/>
            </div>
            <ImageUpload label="Casket Image" value={form.image} onChange={v => upd('image', v)}/>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── VAULTS SECTION ────────────────────────────────────────────────────
function VaultsSection() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', image: '' })

  const load = () => api.get('/api/vaults').then(setItems)
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price) }
    if (modal === 'add') await api.post('/api/vaults', body)
    else await api.put(`/api/vaults/${form.id}`, body)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if (confirm('Delete?')) { await api.del(`/api/vaults/${id}`); load() } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Vaults</h2>
        <button onClick={() => { setForm({ name: '', price: '', image: '' }); setModal('add') }} style={{ padding: '8px 16px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>+ Add Vault</button>
      </div>
      <ProductTable data={items} onEdit={r => { setForm({ ...r, id: r._id || r.id, price: String(r.price), image: r.image || '' }); setModal('edit') }} onDelete={handleDelete} columns={[
        { key: 'image', label: 'Image', render: v => <Thumb url={v}/> },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price', render: v => `$${Number(v).toLocaleString()}` },
      ]}/>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} Vault`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Vault Name" value={form.name} onChange={v => setForm(f => ({...f, name: v}))}/>
            <Inp label="Price ($)" type="number" value={form.price} onChange={v => setForm(f => ({...f, price: v}))}/>
            <ImageUpload label="Vault Image" value={form.image} onChange={v => setForm(f => ({...f, image: v}))}/>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── KEEPSAKES SECTION ────────────────────────────────────────────────
function KeepsakesSection() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', unit: 'each', image: '' })

  const load = () => api.get('/api/keepsakes').then(setItems)
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price) }
    if (modal === 'add') await api.post('/api/keepsakes', body)
    else await api.put(`/api/keepsakes/${form.id}`, body)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if (confirm('Delete?')) { await api.del(`/api/keepsakes/${id}`); load() } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Keepsakes & Service Items</h2>
        <button onClick={() => { setForm({ name: '', price: '', unit: 'each', image: '' }); setModal('add') }} style={{ padding: '8px 16px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>+ Add Item</button>
      </div>
      <ProductTable data={items} onEdit={r => { setForm({ ...r, id: r._id || r.id, price: String(r.price), image: r.image || '' }); setModal('edit') }} onDelete={handleDelete} columns={[
        { key: 'image', label: 'Image', render: v => <Thumb url={v}/> },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price', render: v => `$${Number(v).toLocaleString()}` },
        { key: 'unit', label: 'Unit' },
      ]}/>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} Keepsake`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Name" value={form.name} onChange={v => setForm(f => ({...f, name: v}))}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Price ($)" type="number" value={form.price} onChange={v => setForm(f => ({...f, price: v}))}/>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Unit</label>
                <select value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option>each</option><option>set</option><option>box</option>
                </select>
              </div>
            </div>
            <ImageUpload label="Keepsake Image" value={form.image} onChange={v => setForm(f => ({...f, image: v}))}/>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── LIDS SECTION ────────────────────────────────────────────────────────
function LidsSection() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', image: '' })

  const load = () => api.get('/api/lids').then(setItems)
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    const body = { ...form, price: parseFloat(form.price) }
    if (modal === 'add') await api.post('/api/lids', body)
    else await api.put(`/api/lids/${form.id}`, body)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if (confirm('Delete?')) { await api.del(`/api/lids/${id}`); load() } }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Lids</h2>
        <button onClick={() => { setForm({ name: '', price: '', image: '' }); setModal('add') }} style={{ padding: '8px 16px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>+ Add Lid</button>
      </div>
      <ProductTable data={items} onEdit={r => { setForm({ ...r, id: r._id || r.id, price: String(r.price), image: r.image || '' }); setModal('edit') }} onDelete={handleDelete} columns={[
        { key: 'image', label: 'Image', render: v => <Thumb url={v}/> },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price', render: v => `$${Number(v).toLocaleString()}` },
      ]}/>
      {modal && (
        <Modal title={`${modal === 'add' ? 'Add' : 'Edit'} Lid`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Lid Name" value={form.name} onChange={v => setForm(f => ({...f, name: v}))}/>
            <Inp label="Price ($)" type="number" value={form.price} onChange={v => setForm(f => ({...f, price: v}))}/>
            <ImageUpload label="Lid Image" value={form.image} onChange={v => setForm(f => ({...f, image: v}))}/>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState('packages')
  const TABS = [
    { key: 'packages', label: 'Service Packages' },
    { key: 'caskets', label: 'Caskets' },
    { key: 'vaults', label: 'Vaults' },
    { key: 'keepsakes', label: 'Keepsakes' },
    { key: 'lids', label: 'Lids' },
  ]

  return (
    <div style={{ padding: '24px 32px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Product Management</h1>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: '12px 20px', border: 'none', background: 'none', borderBottom: activeTab === t.key ? '3px solid #2c4a5a' : '3px solid transparent', color: activeTab === t.key ? '#2c4a5a' : '#6b7280', fontWeight: activeTab === t.key ? 700 : 400, cursor: 'pointer', fontSize: 14, marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        {activeTab === 'packages' && <PackagesSection/>}
        {activeTab === 'caskets' && <CasketsSection/>}
        {activeTab === 'vaults' && <VaultsSection/>}
        {activeTab === 'keepsakes' && <KeepsakesSection/>}
        {activeTab === 'lids' && <LidsSection/>}
      </div>
    </div>
  )
}
