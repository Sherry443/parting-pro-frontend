'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 560, maxWidth: 720, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
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

const EMPTY_FORM = {
  question: '', description: '', step: 'services', order: 1,
  type: 'radio', pricePerUnit: '', label: '',
  options: [{ label: '', value: '', price: 0 }]
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = () => api.get('/api/questions').then(setQuestions)
  useEffect(() => { load() }, [])

  const upd = (k, v) => setForm(f => ({...f, [k]: v}))

  const addOption = () => setForm(f => ({...f, options: [...f.options, { label: '', value: '', price: 0 }]}))
  const updateOption = (i, k, v) => setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? {...o, [k]: v} : o) }))
  const removeOption = (i) => setForm(f => ({...f, options: f.options.filter((_, idx) => idx !== i)}))

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (q) => { setForm({ ...EMPTY_FORM, ...q, options: q.options || [] }); setModal('edit') }

  const handleSave = async () => {
    const body = { ...form, order: parseInt(form.order), pricePerUnit: form.pricePerUnit ? parseFloat(form.pricePerUnit) : undefined }
    if (modal === 'add') await api.post('/api/questions', body)
    else await api.put(`/api/questions/${form.id}`, body)
    setModal(null); load()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this question?')) { await api.del(`/api/questions/${id}`); load() }
  }

  const TYPE_LABELS = { radio: '🔘 Radio', counter: '🔢 Counter', checkbox: '☑ Checkbox' }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Questions Management</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Manage the questions shown during the order process (Services step)</p>
        </div>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ Add Question</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {questions.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            No questions yet. Add your first question!
          </div>
        )}
        {questions.map((q, i) => (
          <div key={q.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: '#1e3a5f', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{q.order}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>{q.question}</h3>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{TYPE_LABELS[q.type] || q.type}</span>
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>Step: {q.step}</span>
                </div>
                {q.description && <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.6 }}>{q.description}</p>}
                {q.type === 'radio' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #d1d5db' }}/>
                        <span>{opt.label}</span>
                        {opt.price !== undefined && <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>${opt.price}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'counter' && (
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {q.label} — <strong>${q.pricePerUnit}</strong> per unit
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <button onClick={() => openEdit(q)} style={{ padding: '6px 14px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(q.id)} style={{ padding: '6px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Question' : 'Edit Question'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Inp label="Question" value={form.question} onChange={v => upd('question', v)}/>
            <Inp label="Description (optional)" value={form.description} onChange={v => upd('description', v)} as="textarea"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Step</label>
                <select value={form.step} onChange={e => upd('step', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option value="packages">Packages</option>
                  <option value="goods">Memorial Goods</option>
                  <option value="details">Details</option>
                  <option value="services">Services</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Type</label>
                <select value={form.type} onChange={e => upd('type', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}>
                  <option value="radio">Radio</option>
                  <option value="counter">Counter</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <Inp label="Order (position)" type="number" value={String(form.order)} onChange={v => upd('order', v)}/>
            </div>

            {form.type === 'counter' && (
              <>
                <Inp label="Label (shown to user)" value={form.label} onChange={v => upd('label', v)}/>
                <Inp label="Price Per Unit ($)" type="number" value={form.pricePerUnit} onChange={v => upd('pricePerUnit', v)}/>
              </>
            )}

            {form.type === 'radio' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Options</label>
                  <button onClick={addOption} style={{ padding: '4px 12px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>+ Add Option</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      <input placeholder="Label (e.g. Under 300 lbs.)" value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)}
                        style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}/>
                      <input placeholder="Value (e.g. under300)" value={opt.value} onChange={e => updateOption(i, 'value', e.target.value)}
                        style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}/>
                      <input type="number" placeholder="Price" value={opt.price} onChange={e => updateOption(i, 'price', parseFloat(e.target.value))}
                        style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}/>
                      <button onClick={() => removeOption(i)} style={{ padding: '7px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setModal(null)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2c4a5a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Save Question</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
