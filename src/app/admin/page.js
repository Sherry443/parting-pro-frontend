'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const STATUS_COLORS = {
  'Unpaid': { bg: '#fef3c7', text: '#d97706' },
  'Paid': { bg: '#d1fae5', text: '#065f46' },
  'Partially paid': { bg: '#fed7aa', text: '#c2410c' },
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151' }
  return (
    <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{status}</span>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 500, maxWidth: 700, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Inp({ label, value, onChange, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}/>
    </div>
  )
}

export default function AdminCases() {
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Active')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [newCase, setNewCase] = useState({ decedent: '', type: 'At-need', serviceType: 'Direct Cremation', informant: '', informantPhone: '', caseManager: 'Dean Moncur', funeralDirector: 'Dean Moncur' })

  const load = async () => {
    setLoading(true)
    const [c, s] = await Promise.all([api.get('/api/cases'), api.get('/api/stats')])
    setCases(c); setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = cases.filter(c => {
    const q = search.toLowerCase()
    return !q || c.decedent?.toLowerCase().includes(q) || c.caseId?.toLowerCase().includes(q) || c.informantPhone?.includes(q)
  })

  const handleCreate = async () => {
    await api.post('/api/cases', newCase)
    setShowNew(false)
    setNewCase({ decedent: '', type: 'At-need', serviceType: 'Direct Cremation', informant: '', informantPhone: '', caseManager: 'Dean Moncur', funeralDirector: 'Dean Moncur' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this case?')) return
    await api.del(`/api/cases/${id}`)
    load()
  }

  const handleStatusChange = async (id, paymentStatus) => {
    await api.put(`/api/cases/${id}`, { paymentStatus })
    load()
  }

  const TABS = ['Active', 'Completed', 'Archived', 'Deleted']

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Cases', value: stats.totalCases || 0, color: '#2c4a5a' },
          { label: 'Unpaid', value: stats.unpaid || 0, color: '#d97706' },
          { label: 'Paid', value: stats.paid || 0, color: '#065f46' },
          { label: 'Balance Due', value: `$${(stats.balanceDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#c2410c' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>West River Funeral Directors Cases</h1>
        <button onClick={() => setShowNew(true)} style={{ background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ New case</button>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px 8px 0 0', padding: '0 16px' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 16px', border: 'none', background: 'none', borderBottom: t === tab ? '2px solid #2c4a5a' : '2px solid transparent', color: t === tab ? '#2c4a5a' : '#6b7280', fontWeight: t === tab ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases by name, case ID, or phone"
              style={{ padding: '8px 12px 8px 32px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, width: 320 }}/>
          </div>
          <button style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>⚙ Manage columns</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Date','Case ID','Case type','Decedent','Date of death','Pickup location','Payment status','Balance due','Total paid','Next task','Tasks Progress','Informant','Case manager','Funeral director','Stage','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={16} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={16} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No cases found</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{c.createdAt}</td>
                <td style={{ padding: '10px 12px' }}>
                  {c.caseId ? <span onClick={() => setShowDetail(c)} style={{ color: '#2c4a5a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{c.caseId}</span> : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, color: '#374151' }}>{c.type}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{c.serviceType}</div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {c.decedent ? <span style={{ color: '#2c4a5a', cursor: 'pointer' }} onClick={() => setShowDetail(c)}>{c.decedent?.slice(0,20)}{c.decedent?.length > 20 ? '...' : ''}</span> : <span style={{ color: '#9ca3af' }}>N/A</span>}
                </td>
                <td style={{ padding: '10px 12px', color: '#374151' }}>{c.dateOfDeath || '—'}</td>
                <td style={{ padding: '10px 12px', color: '#374151' }}>{c.pickupLocation ? c.pickupLocation.slice(0,18) + '...' : '—'}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={c.paymentStatus}/></td>
                <td style={{ padding: '10px 12px', color: '#374151' }}>${(c.balanceDue || 0).toFixed(2)}</td>
                <td style={{ padding: '10px 12px', color: '#374151' }}>${(c.totalPaid || 0).toFixed(2)}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af' }}>—</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af' }}>
                  {c.tasksProgress ? <span style={{ fontSize: 11 }}>● {c.tasksProgress}</span> : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12 }}>{c.informant}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{c.informantPhone}</div>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151' }}>{c.caseManager}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#374151' }}>{c.funeralDirector}</td>
                <td style={{ padding: '10px 12px' }}>
                  {c.stage && <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{c.stage}</span>}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setShowDetail(c)} style={{ padding: '4px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>View</button>
                    <button onClick={() => handleStatusChange(c.id, c.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid')} style={{ padding: '4px 8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>
                      {c.paymentStatus === 'Paid' ? 'Unmark' : 'Mark Paid'}
                    </button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '4px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Case Modal */}
      {showNew && (
        <Modal title="+ New Case" onClose={() => setShowNew(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Inp label="Decedent Full Name" value={newCase.decedent} onChange={v => setNewCase(n => ({...n, decedent: v}))}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Case Type</label>
                <select value={newCase.type} onChange={e => setNewCase(n => ({...n, type: e.target.value}))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option>At-need</option><option>Pre-need</option><option>Imminent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Service Type</label>
                <select value={newCase.serviceType} onChange={e => setNewCase(n => ({...n, serviceType: e.target.value}))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option>Direct Cremation</option><option>Cremation With Memorial</option><option>Immediate Burial</option><option>Traditional Burial</option><option>Burial with Graveside</option>
                </select>
              </div>
            </div>
            <Inp label="Informant Name" value={newCase.informant} onChange={v => setNewCase(n => ({...n, informant: v}))}/>
            <Inp label="Informant Phone" value={newCase.informantPhone} onChange={v => setNewCase(n => ({...n, informantPhone: v}))}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Case Manager" value={newCase.caseManager} onChange={v => setNewCase(n => ({...n, caseManager: v}))}/>
              <Inp label="Funeral Director" value={newCase.funeralDirector} onChange={v => setNewCase(n => ({...n, funeralDirector: v}))}/>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowNew(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreate} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Create Case</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Case Detail Modal */}
      {showDetail && (
        <Modal title={`Case ${showDetail.caseId}`} onClose={() => setShowDetail(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Decedent', showDetail.decedent],
              ['Type', `${showDetail.type} — ${showDetail.serviceType}`],
              ['Date of Death', showDetail.dateOfDeath],
              ['Pickup Location', showDetail.pickupLocation],
              ['Payment Status', showDetail.paymentStatus],
              ['Balance Due', `$${(showDetail.balanceDue || 0).toFixed(2)}`],
              ['Total Paid', `$${(showDetail.totalPaid || 0).toFixed(2)}`],
              ['Informant', `${showDetail.informant} — ${showDetail.informantPhone}`],
              ['Case Manager', showDetail.caseManager],
              ['Funeral Director', showDetail.funeralDirector],
              ['Stage', showDetail.stage || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 140, fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{k}</div>
                <div style={{ fontSize: 13, color: '#374151' }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
