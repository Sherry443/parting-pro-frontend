'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const STEPS = ['1. Packages', '2. Memorial Goods', '3. Details', '4. Services', '5. Completion']

const RELATIONSHIPS = [
  'Spouse','Adult child','Parent','Adult sibling','Adult brother','Adult sister',
  'Grandparent','Adult grandchild','Adult niece/nephew','Adult aunt/uncle',
  'Adult great grandchild','Great grandparent','Adult first cousin',
  'Conservator of the person','Conservator of the estate','Friend','Other'
]

const LOCATION_TYPES = ['Home','Hospice','Hospital','Nursing Home','Other Facility']

const FLOWER_IMAGES = {
  purple: 'https://westriverfuneral.partingpro.com/themes/traditional/basic.png',
  white:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
  yellow: 'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=500&q=80',
}

const FALLBACK_CASKET   = 'https://placehold.co/400x220/e8ddd0/7a5c3a?text=Casket'
const FALLBACK_VAULT    = 'https://placehold.co/400x220/b87333/ffffff?text=Vault'
const FALLBACK_KEEPSAKE = 'https://placehold.co/300x160/2c4a5a/ffffff?text=Keepsake'

// ─── HELPERS ────────────────────────────────────────────────────────────
// MongoDB returns _id, not id — always use this to get the real ID
const getId = (item) => item?._id || item?.id || ''

function productImage(item, fallback) {
  const url = item?.image
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) return url
  return fallback
}

// ─── SHARED UI COMPONENTS ───────────────────────────────────────────────
function StepBar({ current, onNavigate }) {
  return (
    <div style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
      <div className="step-bar-inner">
        <div style={{ marginRight: 40, flexShrink: 0 }}>
          <img
            src="https://res.cloudinary.com/deooa4jwy/image/upload/v1775035026/logo_xajf0b.jpg"
            alt="West River Funeral Directors"
            style={{ display: 'block', borderRadius: 4 }}
            width={90} height={52}
          />
        </div>
        <div className="step-tabs">
          {STEPS.map((s, i) => (
            <div
              key={i}
              onClick={() => onNavigate(i)}
              style={{
                flex: '1 0 auto', textAlign: 'center', padding: '16px 8px', fontSize: 12,
                fontWeight: i === current ? 600 : 400,
                color: i === current ? '#233037' : '#2e2a2a',
                borderBottom: i === current ? '3px solid #2e2a2a' : '3px solid transparent',
                cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                minWidth: 90,
              }}
            >
              {s}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: 24, color: '#666', fontSize: 11, cursor: 'pointer' }}>Adjust Order</div>
      </div>
    </div>
  )
}

function FlowerImage({ variant = 'purple' }) {
  return (
    <div className="flower-col">
      <img
        src={FLOWER_IMAGES[variant]}
        alt="Flowers"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = 'https://placehold.co/380x380/c5a0d0/ffffff?text=Flowers' }}
      />
    </div>
  )
}

function RadioCard({ checked, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', cursor: 'pointer' }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${checked ? '#2e2a2a' : '#ccc'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, background: checked ? '#2e2a2a' : '#fff', transition: 'all .2s'
      }}>
        {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }}/>}
      </div>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }}/>
      <span style={{ fontSize: 16, color: '#333' }}>{children}</span>
    </label>
  )
}

function Btn({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 20px', background: '#2d3f50', color: '#fff',
      border: '2px solid #2e2a2a', borderRadius: 4, fontSize: 12,
      fontWeight: 600, letterSpacing: 1, cursor: 'pointer', ...style
    }}>
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#2e2a2a', cursor: 'pointer', fontSize: 14 }}>
      ‹ BACK
    </button>
  )
}

function Input({ label, value, onChange, required, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{label}{required && '*'}</label>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, outline: 'none' }}
      />
    </div>
  )
}

// ─── STEP 1: PACKAGES ───────────────────────────────────────────────────
function Step1Packages({ order, setOrder, onNext }) {
  const [subStep, setSubStep] = useState(1)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)

  const loadPackages = async (category) => {
    setLoading(true)
    try {
      const data = await api.get(`/api/packages?category=${category}`)
      // Ensure array — safety net
      setPackages(Array.isArray(data) ? data : [])
    } catch {
      setPackages([])
    }
    setLoading(false)
  }

  if (subStep === 1) return (
    <div className="step-layout">
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, color: '#2e2a2a', marginBottom: 32, lineHeight: 1.4 }}>
          Please provide some basic information so we can<br/>help you select an appropriate service package
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: 32, maxWidth: 560 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>When will you require services?</h3>
          <RadioCard checked={order.timing === 'immediately'} onChange={() => setOrder(o => ({...o, timing: 'immediately'}))}>Immediately, my loved one has passed</RadioCard>
          <RadioCard checked={order.timing === 'soon'} onChange={() => setOrder(o => ({...o, timing: 'soon'}))}>Soon, I'm preparing for end-of-life needs within 6 months</RadioCard>
          <RadioCard checked={order.timing === 'future'} onChange={() => setOrder(o => ({...o, timing: 'future'}))}>In the future, I'm pre-planning beyond 6 months</RadioCard>
          <div style={{ marginTop: 24 }}><Btn onClick={() => order.timing && setSubStep(2)}>CONTINUE</Btn></div>
          <div style={{ marginTop: 16, textAlign: 'right', color: '#999', fontSize: 13 }}>Step 1 of 2</div>
        </div>
      </div>
      <FlowerImage variant="purple"/>
    </div>
  )

  if (subStep === 2) return (
    <div className="step-layout step-layout-center">
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, color: '#2e2a2a', marginBottom: 32, lineHeight: 1.4 }}>
          Please provide some basic information so we can<br/>help you select an appropriate service package
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: 32, maxWidth: 560 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Which type of service would you like?</h3>
          <RadioCard checked={order.serviceType === 'cremation'} onChange={() => setOrder(o => ({...o, serviceType: 'cremation'}))}>Cremation</RadioCard>
          <RadioCard checked={order.serviceType === 'burial'} onChange={() => setOrder(o => ({...o, serviceType: 'burial'}))}>Burial</RadioCard>
          <div style={{ marginTop: 24 }}>
            <Btn onClick={() => { if (!order.serviceType) return; loadPackages(order.serviceType); setSubStep(3) }}>CONTINUE</Btn>
          </div>
          <div style={{ marginTop: 16, textAlign: 'right', color: '#999', fontSize: 13 }}>Step 2 of 2</div>
        </div>
        <div style={{ marginTop: 16 }}><BackBtn onClick={() => setSubStep(1)}/></div>
      </div>
      <FlowerImage variant="purple"/>
    </div>
  )

  // Packages grid
  return (
    <div className="content-container">
      <h2 style={{ fontSize: 16, color: '#2e2a2a', marginBottom: 32, textAlign: 'center' }}>Select a service package</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading packages...</div>
      ) : packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No packages found. Please go back and try again.</div>
      ) : (
        <div className="packages-grid" style={{ gridTemplateColumns: `repeat(${Math.min(packages.length, 3)}, 1fr)` }}>
          {packages.map(pkg => {
            const pkgId = getId(pkg)
            const isSelected = getId(order.selectedPackage) === pkgId
            return (
              <div
                key={pkgId}
                onClick={() => setOrder(o => ({ ...o, selectedPackage: pkg }))}
                style={{
                  border: isSelected ? '3px solid #2e2a2a' : '1px solid #e5e7eb',
                  borderRadius: 4,
                  padding: isSelected ? 26 : 28,
                  background: '#fff',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all .2s',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 26, height: 26, background: '#2e2a2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>✓</div>
                )}
                {productImage(pkg, null) && (
                  <div style={{ margin: '-28px -28px 20px -28px', overflow: 'hidden', borderRadius: '4px 4px 0 0' }}>
                    <img
                      src={productImage(pkg, null)}
                      alt={pkg.name}
                      style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                      onError={e => { e.currentTarget.parentElement.style.display = 'none' }}
                    />
                  </div>
                )}
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1, color: '#333', marginBottom: 8 }}>{pkg.name.toUpperCase()}</h3>
                <div style={{ fontSize: 13, color: '#777', marginBottom: 4 }}>starting at</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#333', marginBottom: 16 }}>${pkg.price.toLocaleString()}</div>
                {pkg.description && (
                  <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.6, borderBottom: '1px solid #eee', paddingBottom: 16 }}>{pkg.description}</p>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 12 }}>This package includes:</div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {pkg.includes?.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', marginBottom: 8 }}>
                      <span style={{ color: '#2e2a2a' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setOrder(o => ({ ...o, selectedPackage: pkg })); onNext() }}
                    style={{ width: '100%', padding: '12px', background: '#2e2a2a', color: '#fff', border: '2px solid #2e2a2a', borderRadius: 4, fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}
                  >
                    SELECT
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <BackBtn onClick={() => setSubStep(2)}/>
        <Btn onClick={() => order.selectedPackage && onNext()}>CONTINUE</Btn>
      </div>
    </div>
  )
}

// ─── STEP 2: MEMORIAL GOODS ─────────────────────────────────────────────
function Step2MemorialGoods({ order, setOrder, onNext, onBack }) {
  const [subStep, setSubStep] = useState(1)
  const [caskets, setCaskets] = useState(null)
  const [vaults, setVaults] = useState(null)
  const [keepsakes, setKeepsakes] = useState(null)
  const [viewingCasket, setViewingCasket] = useState(null)

  useEffect(() => {
    api.get('/api/caskets').then(d => setCaskets(Array.isArray(d) ? d : [])).catch(() => setCaskets([]))
    api.get('/api/vaults').then(d => setVaults(Array.isArray(d) ? d : [])).catch(() => setVaults([]))
    api.get('/api/keepsakes').then(d => setKeepsakes(Array.isArray(d) ? d : [])).catch(() => setKeepsakes([]))
  }, [])

  const setQty = (id, qty) => setOrder(o => ({ ...o, keepsakes: { ...(o.keepsakes || {}), [id]: qty } }))
  const selectCasket = (casket) => setOrder(o => ({ ...o, casket }))
  const selectVault  = (vault)  => setOrder(o => ({ ...o, vault }))

  // Casket detail view
  if (subStep === 1 && viewingCasket) {
    const img = productImage(viewingCasket, FALLBACK_CASKET)
    return (
      <div className="content-container">
        <button onClick={() => setViewingCasket(null)} style={{ background: 'none', border: 'none', color: '#2e2a2a', cursor: 'pointer', fontSize: 14, marginBottom: 24 }}>‹ BACK TO CASKETS</button>
        <div className="casket-detail-layout">
          <div style={{ flex: 1 }}>
            <div style={{ borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
              <img src={img} alt={viewingCasket.name} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = FALLBACK_CASKET }}/>
            </div>
            <div style={{ border: '2px solid #e5e7eb', borderRadius: 4, overflow: 'hidden', width: 90, height: 60 }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 26, marginBottom: 12 }}>{viewingCasket.name}</h2>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>${viewingCasket.price.toLocaleString()}</div>
            <Btn onClick={() => { selectCasket(viewingCasket); setViewingCasket(null); setSubStep(2) }}>SELECT</Btn>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {viewingCasket.material && <div style={{ fontSize: 14, color: '#555' }}>Material: {viewingCasket.material}</div>}
              {viewingCasket.interior && <div style={{ fontSize: 14, color: '#555' }}>{viewingCasket.interior} Interior</div>}
              {viewingCasket.features?.map((f, i) => <div key={i} style={{ fontSize: 14, color: '#555' }}>{f}</div>)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Caskets grid
  if (subStep === 1) return (
    <div className="content-container">
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Select a casket by clicking an image below</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 32 }}>The law requires the body to be placed in a casket for dignified care, respect, and handling of the deceased.</p>
      {caskets === null ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading caskets...</div>
      ) : caskets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#c00' }}>Could not load caskets. Make sure the backend is running.</div>
      ) : (
        <div className="product-grid-3">
          {caskets.map(c => {
            const cId = getId(c)
            const isSelected = getId(order.casket) === cId
            return (
              <div key={cId} style={{ border: isSelected ? '3px solid #2e2a2a' : '1px solid #e5e7eb', padding: isSelected ? 14 : 16, background: '#fff', transition: 'border 0.15s, padding 0.15s', position: 'relative' }}>
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: '#2e2a2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, zIndex: 1 }}>✓</div>
                )}
                <div style={{ marginBottom: 12, overflow: 'hidden', borderRadius: 4, cursor: 'pointer' }} onClick={() => setViewingCasket(c)}>
                  <img
                    src={productImage(c, FALLBACK_CASKET)}
                    alt={c.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = FALLBACK_CASKET }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>${c.price.toLocaleString()}</div>
                  <button
                    onClick={() => { selectCasket(c); setSubStep(2) }}
                    style={{ padding: '6px 16px', background: isSelected ? '#2e2a2a' : '#fff', color: isSelected ? '#fff' : '#2e2a2a', border: '2px solid #2e2a2a', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </button>
                  <button
                    onClick={() => setViewingCasket(c)}
                    style={{ padding: '6px 12px', background: '#f5f5f5', color: '#555', border: '1px solid #ccc', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <BackBtn onClick={onBack}/>
        {order.casket && <Btn onClick={() => setSubStep(2)}>CONTINUE</Btn>}
      </div>
    </div>
  )

  // Vaults grid
  if (subStep === 2) return (
    <div className="content-container">
      <h2 style={{ fontSize: 20, marginBottom: 32 }}>Select a vault by clicking an image below</h2>
      {vaults === null ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading vaults...</div>
      ) : vaults.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#c00' }}>Could not load vaults. Make sure the backend is running.</div>
      ) : (
        <div className="product-grid-3">
          {vaults.map(v => {
            const vId = getId(v)
            const isSelected = getId(order.vault) === vId
            return (
              <div key={vId} style={{ border: isSelected ? '3px solid #2e2a2a' : '1px solid #e5e7eb', padding: isSelected ? 14 : 16, background: '#fff', transition: 'border 0.15s, padding 0.15s', position: 'relative' }}>
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: '#2e2a2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, zIndex: 1 }}>✓</div>
                )}
                <div style={{ marginBottom: 12, overflow: 'hidden', borderRadius: 4, cursor: 'pointer' }} onClick={() => selectVault(v)}>
                  <img
                    src={productImage(v, FALLBACK_VAULT)}
                    alt={v.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = FALLBACK_VAULT }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>${v.price.toLocaleString()}</div>
                  <button
                    onClick={() => { selectVault(v); setSubStep(3) }}
                    style={{ marginTop: 4, padding: '8px 12px', background: '#2e2a2a', color: '#fff', border: '2px solid #2e2a2a', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isSelected ? '✓ Selected' : 'SELECT'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <BackBtn onClick={() => setSubStep(1)}/>
        {order.vault && <Btn onClick={() => setSubStep(3)}>CONTINUE</Btn>}
      </div>
    </div>
  )

  // Keepsakes
  return (
    <div className="content-container">
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Select a keepsake or service item by clicking an image below</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 32 }}>You may select multiple items.</p>
      {keepsakes === null ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading keepsakes...</div>
      ) : keepsakes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#c00' }}>Could not load keepsakes. Make sure the backend is running.</div>
      ) : null}
      <div className="product-grid-3">
        {(keepsakes || []).map(k => {
          const kId = getId(k)
          const qty = order.keepsakes?.[kId] || 0
          return (
            <div key={kId} style={{ border: qty > 0 ? '3px solid #2e2a2a' : '1px solid #e5e7eb', padding: qty > 0 ? 14 : 16, background: '#fff', transition: 'border 0.15s, padding 0.15s' }}>
              <div style={{ marginBottom: 12, overflow: 'hidden', borderRadius: 4, cursor: 'pointer' }} onClick={() => setQty(kId, qty > 0 ? 0 : 1)}>
                <img
                  src={productImage(k, FALLBACK_KEEPSAKE)}
                  alt={k.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = FALLBACK_KEEPSAKE }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{k.name}</div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>${k.price}</div>
                <div style={{ fontSize: 13, color: '#888' }}>Quantity: {qty}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                  <button onClick={() => setQty(kId, Math.max(0, qty - 1))} style={{ width: 28, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 16, background: '#fff' }}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(kId, qty + 1)} style={{ width: 28, height: 28, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 16, background: '#fff' }}>+</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: 13, color: '#666', marginTop: 24, background: '#f8f9fa', padding: 16, borderRadius: 4 }}>
        This is a curated selection of our most popular options. We have many more to choose from and you can upgrade at anytime after payment.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <BackBtn onClick={() => setSubStep(2)}/>
        <Btn onClick={onNext}>CONTINUE</Btn>
      </div>
    </div>
  )
}

// ─── STEP 3: DETAILS ────────────────────────────────────────────────────
function Step3Details({ order, setOrder, onNext, onBack }) {
  const [subStep, setSubStep] = useState(1)
  const [form, setForm] = useState({
    deceasedFirst:  order.details?.deceasedFirst  || '',
    deceasedMiddle: order.details?.deceasedMiddle || '',
    deceasedLast:   order.details?.deceasedLast   || '',
    deceasedSuffix: order.details?.deceasedSuffix || '',
    yourFirst:      order.details?.yourFirst      || '',
    yourMiddle:     order.details?.yourMiddle     || '',
    yourLast:       order.details?.yourLast       || '',
    yourSuffix:     order.details?.yourSuffix     || '',
    relationship:   order.details?.relationship   || '',
    inCare:         order.details?.inCare         || '',
    locationType:   order.details?.locationType   || 'Home',
    facilityName:   order.details?.facilityName   || '',
    streetAddress:  order.details?.streetAddress  || '',
    city:           order.details?.city           || '',
    state:          order.details?.state          || 'SD',
    zip:            order.details?.zip            || '',
  })
  const upd = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleNext = () => {
    if (subStep < 5) setSubStep(s => s + 1)
    else { setOrder(o => ({...o, details: form})); onNext() }
  }

  const content = () => {
    if (subStep === 1) return (
      <>
        <h3 style={{ fontSize: 17, marginBottom: 24 }}>What is the full legal name of your loved one?</h3>
        <div className="name-grid">
          <Input label="First Name"  required value={form.deceasedFirst}  onChange={v => upd('deceasedFirst', v)}/>
          <Input label="Middle Name"          value={form.deceasedMiddle} onChange={v => upd('deceasedMiddle', v)}/>
          <Input label="Last Name"   required value={form.deceasedLast}   onChange={v => upd('deceasedLast', v)}/>
          <Input label="Suffix"               value={form.deceasedSuffix} onChange={v => upd('deceasedSuffix', v)}/>
        </div>
      </>
    )
    if (subStep === 2) return (
      <>
        <h3 style={{ fontSize: 17, marginBottom: 24 }}>What is your full legal name?</h3>
        <div className="name-grid">
          <Input label="First Name"  required value={form.yourFirst}  onChange={v => upd('yourFirst', v)}/>
          <Input label="Middle Name"          value={form.yourMiddle} onChange={v => upd('yourMiddle', v)}/>
          <Input label="Last Name"   required value={form.yourLast}   onChange={v => upd('yourLast', v)}/>
          <Input label="Suffix"               value={form.yourSuffix} onChange={v => upd('yourSuffix', v)}/>
        </div>
      </>
    )
    if (subStep === 3) return (
      <>
        <h3 style={{ fontSize: 17, marginBottom: 24 }}>What is your relationship to the deceased?</h3>
        <select value={form.relationship} onChange={e => upd('relationship', e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, background: '#fff' }}>
          <option value="">Select relationship</option>
          {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </>
    )
    if (subStep === 4) return (
      <>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>Is your loved one currently in our care?</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>This information will help us determine if we need to arrange transportation of your loved one.</p>
        <RadioCard checked={form.inCare === 'no'}  onChange={() => upd('inCare', 'no')}>No, my loved one needs to be taken into your care</RadioCard>
        <RadioCard checked={form.inCare === 'yes'} onChange={() => upd('inCare', 'yes')}>Yes, my loved one is currently in your care</RadioCard>
      </>
    )
    return (
      <>
        <h3 style={{ fontSize: 17, marginBottom: 20 }}>Please enter the location we'll need to come take your loved one into our care</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Location Type*</label>
            <select value={form.locationType} onChange={e => upd('locationType', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, background: '#fff' }}>
              {LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Facility Name"   required value={form.facilityName}  onChange={v => upd('facilityName', v)}/>
          <Input label="Street Address"  required value={form.streetAddress} onChange={v => upd('streetAddress', v)}/>
          <div className="city-state-zip-grid">
            <Input label="City" required value={form.city} onChange={v => upd('city', v)}/>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>State*</label>
              <select value={form.state} onChange={e => upd('state', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, background: '#fff' }}>
                {['SD','ND','NE','WY','MT','MN','IA','CO'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Input label="Zip Code" required value={form.zip} onChange={v => upd('zip', v)}/>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: '#2e2a2a' }}/>
            This is also the location where my loved one passed
          </label>
        </div>
      </>
    )
  }

  return (
    <div className="step-layout">
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, color: '#2e2a2a', marginBottom: 32, lineHeight: 1.4 }}>
          Provide us with some basic information about<br/>you and your loved one
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 32, maxWidth: 560 }}>
          {content()}
          <div style={{ marginTop: 24 }}><Btn onClick={handleNext}>CONTINUE</Btn></div>
          <div style={{ marginTop: 16, textAlign: 'right', color: '#999', fontSize: 13 }}>Step {subStep} of 5</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <BackBtn onClick={subStep === 1 ? onBack : () => setSubStep(s => s - 1)}/>
        </div>
      </div>
      <FlowerImage variant="white"/>
    </div>
  )
}

// ─── STEP 4: SERVICES ───────────────────────────────────────────────────
function Step4Services({ order, setOrder, onNext, onBack }) {
  const [subStep, setSubStep] = useState(1)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState(order.services || {})

  useEffect(() => {
    api.get('/api/questions').then(d => setQuestions(Array.isArray(d) ? d : []))
  }, [])

  const serviceQuestions = questions.filter(q => q.step === 'services').sort((a, b) => a.order - b.order)
  const q     = serviceQuestions[subStep - 1]
  const total = serviceQuestions.length

  const handleNext = () => {
    if (subStep < total) setSubStep(s => s + 1)
    else { setOrder(o => ({...o, services: answers, serviceQuestions})); onNext() }
  }

  if (!q && total === 0) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>
      No service questions configured.{' '}
      <Btn onClick={() => { setOrder(o => ({...o, services: {}, serviceQuestions: []})); onNext() }}>CONTINUE</Btn>
    </div>
  )
  if (!q) return <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>Loading questions...</div>

  return (
    <div className="step-layout">
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 16, color: '#2e2a2a', marginBottom: 32, lineHeight: 1.4 }}>
          Please answer a few remaining questions to<br/>determine if you need any additional services
        </h2>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 32, maxWidth: 560 }}>
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>{q.question}</h3>
          {q.description && <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>{q.description}</p>}

          {q.type === 'radio' && q.options?.map(opt => (
            <div key={opt.value}>
              <RadioCard checked={answers[q.id] === opt.value} onChange={() => setAnswers(a => ({...a, [q.id]: opt.value}))}>
                {opt.label}
              </RadioCard>
              {opt.price !== undefined && (
                <div style={{ marginLeft: 34, fontSize: 13, color: '#666', marginBottom: 4 }}>${Number(opt.price).toFixed(2)}</div>
              )}
            </div>
          ))}

          {q.type === 'counter' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
              <button onClick={() => setAnswers(a => ({...a, [q.id]: Math.max(0, (a[q.id] || 0) - 1)}))}
                style={{ width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, fontSize: 20, cursor: 'pointer', background: '#fff' }}>−</button>
              <span style={{ fontSize: 16, minWidth: 30, textAlign: 'center' }}>{answers[q.id] || 0}</span>
              <button onClick={() => setAnswers(a => ({...a, [q.id]: (a[q.id] || 0) + 1}))}
                style={{ width: 32, height: 32, border: '1px solid #ccc', borderRadius: 4, fontSize: 20, cursor: 'pointer', background: '#fff' }}>+</button>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{q.label}</div>
                <div style={{ fontSize: 13, color: '#666' }}>${q.pricePerUnit} per copy</div>
              </div>
            </div>
          )}

          {q.type === 'checkbox' && q.options?.map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!(answers[q.id] || []).includes(opt.value)}
                onChange={e => {
                  const prev = answers[q.id] || []
                  setAnswers(a => ({...a, [q.id]: e.target.checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value)}))
                }}
                style={{ accentColor: '#2e2a2a', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 15, color: '#333' }}>{opt.label}</span>
              {opt.price !== undefined && <span style={{ fontSize: 13, color: '#666' }}>${Number(opt.price).toFixed(2)}</span>}
            </label>
          ))}

          <div style={{ marginTop: 24 }}><Btn onClick={handleNext}>CONTINUE</Btn></div>
          <div style={{ marginTop: 16, textAlign: 'right', color: '#999', fontSize: 13 }}>Step {subStep} of {total}</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <BackBtn onClick={subStep === 1 ? onBack : () => setSubStep(s => s - 1)}/>
        </div>
      </div>
      <FlowerImage variant="yellow"/>
    </div>
  )
}

// ─── STEP 5: COMPLETION ─────────────────────────────────────────────────
function Step5Completion({ order, setStep, onBack }) {
  const [payTab, setPayTab]     = useState('now')
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', expiry: '', cvc: '', street: '', unit: '', city: '', state: 'SD', zip: '', email: '', phone: '' })
  const [agreed1, setAgreed1]   = useState(false)
  const [agreed2, setAgreed2]   = useState(false)
  const [agreed3, setAgreed3]   = useState(false)
  const [signature, setSignature]   = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [caseId, setCaseId]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [stripeError, setStripeError] = useState('')

  const pkg    = order.selectedPackage
  const casket = order.casket
  const vault  = order.vault

  const keepsakeEntries  = order.keepsakes    || {}
  const serviceQuestions = order.serviceQuestions || []
  const services         = order.services     || {}
  const keepsakeData     = order.keepsakeData || []

  // Keepsake lines
  const keepsakeItems = Object.entries(keepsakeEntries).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ id, qty }))
  let keepsakeTotal = 0
  const keepsakeLines = keepsakeItems.map(({ id, qty }) => {
    // Match by _id or id
    const data = keepsakeData.find(k => String(getId(k)) === String(id))
    const price = data ? data.price * qty : 0
    keepsakeTotal += price
    return { label: data ? `${data.name} ×${qty}` : `Keepsake ×${qty}`, val: price }
  })

  // Additional service lines
  let additionalServicesTotal = 0
  const additionalServiceLines = []
  serviceQuestions.forEach(q => {
    const answer = services[q.id]
    if (q.type === 'radio' && answer) {
      const opt = q.options?.find(o => o.value === answer)
      if (opt?.price > 0) { additionalServicesTotal += opt.price; additionalServiceLines.push({ label: `${q.question}: ${opt.label}`, val: opt.price }) }
    }
    if (q.type === 'counter' && answer > 0) {
      const lineTotal = answer * (q.pricePerUnit || 0)
      additionalServicesTotal += lineTotal
      additionalServiceLines.push({ label: `${q.label || q.question} (×${answer})`, val: lineTotal })
    }
    if (q.type === 'checkbox' && Array.isArray(answer)) {
      answer.forEach(val => {
        const opt = q.options?.find(o => o.value === val)
        if (opt?.price > 0) { additionalServicesTotal += opt.price; additionalServiceLines.push({ label: `${q.question}: ${opt.label}`, val: opt.price }) }
      })
    }
  })

  const pkgPrice      = pkg?.price    || 0
  const casketPrice   = casket?.price || 0
  const vaultPrice    = vault?.price  || 0
  const vaultSetupFee = vault ? 500 : 0
  const subtotal = pkgPrice + casketPrice + vaultPrice + vaultSetupFee + additionalServicesTotal + keepsakeTotal
  const tax        = subtotal * 0.062
  const processFee = subtotal * 0.032
  const total      = subtotal + tax + processFee

  const handleSubmit = async () => {
    setSubmitting(true)
    setStripeError('')
    try {
      if (payTab === 'now') {
        const r = await api.post('/api/stripe/checkout-session', { ...order })
        if (r?.url) { window.location.href = r.url; return }
        setStripeError(r?.error || 'Unable to start payment. Please try again.')
      } else {
        const result = await api.post('/api/orders', { ...order, payment: { method: 'pay_later', ...cardInfo } })
        if (result.success) { setCaseId(result.caseId); setSubmitted(true) }
        else setStripeError(result?.error?.message || 'Order submission failed. Please try again.')
      }
    } catch (e) {
      setStripeError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Stripe redirect back
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const ok        = params.get('stripe_success')
    const sessionId = params.get('session_id')
    if (!ok || !sessionId) return
    ;(async () => {
      try {
        setSubmitting(true)
        const r = await api.post('/api/stripe/confirm-checkout', { session_id: sessionId })
        if (r?.success) {
          setCaseId(r.caseId)
          setSubmitted(true)
          window.history.replaceState({}, '', window.location.pathname)
          return
        }
        setStripeError(r?.error || 'Payment verification failed. Please contact support.')
      } catch { setStripeError('Payment verification failed. Please contact support.') }
      finally  { setSubmitting(false) }
    })()
  }, [])

  if (submitted) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 32px' }}>
      <div style={{ width: 80, height: 80, background: '#2e7d6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36, color: '#fff' }}>✓</div>
      <h2 style={{ fontSize: 28, color: '#2e2a2a', marginBottom: 16 }}>Order Submitted Successfully</h2>
      <p style={{ color: '#666', marginBottom: 8 }}>Case ID: <strong>{caseId}</strong></p>
      <p style={{ color: '#666', marginBottom: 24 }}>Our team will contact you shortly. Call us at <strong>605-787-3940</strong>.</p>
      <p style={{ color: '#888', fontSize: 13 }}>420 East Saint Patrick Street, Suite 106, Rapid City, SD 57701</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: 'clamp(0px, 2vw, 24px) clamp(12px, 3vw, 24px) 40px' }}>
      <div style={{ textAlign: 'center', padding: '14px 0 4px', fontSize: 13, color: '#555' }}>420 East Saint Patrick Street, Suite 106, Rapid City, SD 57701</div>
      <div style={{ textAlign: 'right', fontSize: 13, color: '#555', marginBottom: 20 }}>Need help? Call us at <strong>605-787-3940</strong></div>

      <div className="completion-layout">

        {/* ── LEFT: Statement ── */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, padding: '24px 28px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>Statement of funeral goods and services</h3>

          {/* Service package */}
          <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Service package</span>
              <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: '#2e7d6b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Edit</button>
            </div>
            {pkg ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                  <span>{pkg.name}</span>
                  <span>${pkgPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: 4, padding: '12px 16px', fontSize: 12, color: '#555' }}>
                  <div style={{ marginBottom: 6, color: '#444' }}>This package includes:</div>
                  {pkg.includes?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                      <span style={{ marginTop: 1 }}>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div style={{ fontSize: 13, color: '#9ca3af' }}>No package selected</div>}
          </div>

          {/* Memorial Goods */}
          <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Memorial Goods</span>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2e7d6b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Edit</button>
            </div>
            {casket
              ? <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>{casket.name}</span><span>${casketPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              : <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>No casket selected</div>}
            {vault
              ? <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>{vault.name}</span><span>${vaultPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              : <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>No vault selected</div>}
            {keepsakeLines.filter(l => l.val > 0).map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{l.label}</span><span>${l.val.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Additional services */}
          <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Additional services and required fees</span>
              <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#2e7d6b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Edit</button>
            </div>
            {vault && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Vault Setup Fee (required)</span><span>$500.00</span>
              </div>
            )}
            {additionalServiceLines.length > 0 ? additionalServiceLines.map(({ label, val }, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{label}</span><span>${Number(val).toFixed(2)}</span>
              </div>
            )) : <div style={{ fontSize: 13, color: '#9ca3af' }}>No additional charges</div>}
          </div>

          {/* Summary */}
          <div style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Summary</div>
            {[
              { label: 'Total before tax & processing fee', val: subtotal },
              { label: 'Tax collected (6.2%)',              val: tax },
              { label: 'Payment processing fee (3.2%)',     val: processFee },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: '#444' }}>
                <span>{label}</span><span>${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #ccc', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700 }}>
            <span>Order total</span><span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Order details */}
          <div style={{ borderTop: '1px solid #eee', marginTop: 24, paddingTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Order details</div>
            {[
              { label: 'Service provider',  val: 'West River Funeral Directors' },
              { label: 'Name of deceased',  val: `${order.details?.deceasedFirst || ''} ${order.details?.deceasedLast || ''}`.trim() || 'N/A' },
              { label: 'Pick up location',  val: order.details?.facilityName ? `${order.details.facilityName}, ${order.details.city || ''}, ${order.details.state || 'SD'} ${order.details.zip || ''}`.trim() : 'N/A' },
              { label: 'Delivery method',   val: '' },
              { label: 'Method of payment', val: payTab === 'now' ? 'Credit Card' : 'Pay Later' },
            ].map(({ label, val }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#444' }}>{val || ''}</div>
              </div>
            ))}
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#2e7d6b', cursor: 'pointer', fontSize: 12, padding: 0 }}>Edit order details →</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 13 }}>‹ Back</button>
            <button onClick={() => window.print()} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 13 }}>Print page</button>
          </div>

          <div style={{ marginTop: 16, padding: '14px 16px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11.5, color: '#555', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 10 }}>Charges are only for those items that you selected or that are required. If we are required by law or by a cemetery or crematory to use any items, we will explain the reasons in writing here: none.</p>
            <p style={{ marginBottom: 10 }}>If you selected an arrangement that may require embalming, such as an arrangement with viewing, you may have to pay for embalming. You do not have to pay for embalming you did not approve if you selected arrangements such as a direct cremation or immediate burial. If we charged for embalming, we will explain why here: none.</p>
            <p>We charge you for our services in obtaining: none.</p>
          </div>
        </div>

        {/* ── RIGHT: Payment ── */}
        <div className="payment-panel">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>Payment</h3>

          <div style={{ display: 'flex', marginBottom: 16, border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
            {['now', 'later'].map(tab => (
              <button key={tab} onClick={() => setPayTab(tab)} style={{
                flex: 1, padding: '9px 0', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: payTab === tab ? '#2e2a2a' : '#fff',
                color:      payTab === tab ? '#fff'    : '#333',
              }}>
                Pay {tab === 'now' ? 'Now' : 'Later'}
              </button>
            ))}
          </div>

          {payTab === 'now' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 14 }}>Select Pay Now to complete with your card today.</p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Cardholder name</label>
                <input value={cardInfo.name} onChange={e => setCardInfo(c => ({...c, name: e.target.value}))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💳</span><span style={{ fontWeight: 600 }}>Card</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Card number</label>
                  <input value={cardInfo.number} onChange={e => setCardInfo(c => ({...c, number: e.target.value}))} placeholder="1234 1234 1234 1234"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Expiration date</label>
                    <input value={cardInfo.expiry} onChange={e => setCardInfo(c => ({...c, expiry: e.target.value}))} placeholder="MM / YY"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Security code</label>
                    <input value={cardInfo.cvc} onChange={e => setCardInfo(c => ({...c, cvc: e.target.value}))} placeholder="CVC"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#1a1a1a' }}>Billing address</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Street address*</label>
                  <input value={cardInfo.street} onChange={e => setCardInfo(c => ({...c, street: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Unit #</label>
                  <input value={cardInfo.unit} onChange={e => setCardInfo(c => ({...c, unit: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>City*</label>
                  <input value={cardInfo.city} onChange={e => setCardInfo(c => ({...c, city: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>State*</label>
                  <select value={cardInfo.state} onChange={e => setCardInfo(c => ({...c, state: e.target.value}))}
                    style={{ width: '100%', padding: '8px 6px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, background: '#fff', boxSizing: 'border-box' }}>
                    {['SD','ND','NE','WY','MT','MN','IA','CO'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Zip code*</label>
                  <input value={cardInfo.zip} onChange={e => setCardInfo(c => ({...c, zip: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#1a1a1a' }}>Contact information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Email address*</label>
                  <input value={cardInfo.email} onChange={e => setCardInfo(c => ({...c, email: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>Phone number*</label>
                  <input value={cardInfo.phone} onChange={e => setCardInfo(c => ({...c, phone: e.target.value}))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
              </div>
            </div>
          )}

          {payTab === 'later' && (
            <div style={{ padding: '20px 0', fontSize: 13, color: '#555', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 12 }}>Select Pay Later if you'd like to complete payment by phone or in person. Our team will reach out to finalize your order.</p>
              <p>Call us at <strong>605-787-3940</strong> during business hours to complete your payment.</p>
            </div>
          )}

          {/* Customer agreement */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' }}>Customer agreement</div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#444', marginBottom: 12, cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" checked={agreed1} onChange={e => setAgreed1(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }}/>
              I have reviewed and acknowledged the required <span style={{ color: '#2e7d6b', textDecoration: 'underline', cursor: 'pointer' }}>agreements.</span>
            </label>
            <div style={{ background: '#eef4fb', border: '1px solid #c8ddf0', borderRadius: 4, padding: '12px 14px', fontSize: 12, color: '#444', marginBottom: 12, lineHeight: 1.6, display: 'flex', gap: 8 }}>
              <span style={{ color: '#3a7bd5', fontSize: 14, flexShrink: 0 }}>ℹ</span>
              <span>If you have not already spoken to the funeral home to arrange the transportation of your loved one into their care, please call the funeral home now at 605-787-3940.</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#444', marginBottom: 16, cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" checked={agreed2} onChange={e => setAgreed2(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }}/>
              I understand and agree that I must contact the funeral home if transportation has not been arranged.
            </label>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>Electronic Signature</div>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 12, lineHeight: 1.6 }}>An electronic signature is needed before payment. By typing your first and last name below, you agree that this is a legal representation of your signature.</p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#444', marginBottom: 12, cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" checked={agreed3} onChange={e => setAgreed3(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }}/>
              I have read and agree to the <span style={{ color: '#2e7d6b', textDecoration: 'underline', cursor: 'pointer' }}>electronic records and signature agreement.</span>
            </label>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: '#444', display: 'block', marginBottom: 4 }}>First and last name</label>
              <input value={signature} onChange={e => setSignature(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !agreed1 || !agreed2 || !agreed3 || !signature}
              style={{
                width: '100%', marginTop: 14, padding: '13px',
                background: agreed1 && agreed2 && agreed3 && signature ? '#2e7d6b' : '#9bb5b0',
                color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600,
                cursor: !submitting && agreed1 && agreed2 && agreed3 && signature ? 'pointer' : 'not-allowed',
                letterSpacing: 0.3,
              }}
            >
              {submitting ? 'Processing...' : 'Submit payment'}
            </button>
            {stripeError && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: 6 }}>
                {stripeError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ROOT: OrderPage ─────────────────────────────────────────────────────
export default function OrderPage() {
  const [step, setStep]   = useState(0)
  const [order, setOrder] = useState({})

  const handleSetStep = (s) => setStep(s)

  // Cache keepsake prices in order state when entering step 1
  useEffect(() => {
    if (step === 1) {
      api.get('/api/keepsakes')
        .then(d => setOrder(o => ({ ...o, keepsakeData: Array.isArray(d) ? d : [] })))
        .catch(() => {})
    }
  }, [step])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <StepBar current={step} onNavigate={handleSetStep}/>
      {step === 0 && <Step1Packages     order={order} setOrder={setOrder} onNext={() => handleSetStep(1)}/>}
      {step === 1 && <Step2MemorialGoods order={order} setOrder={setOrder} onNext={() => handleSetStep(2)} onBack={() => handleSetStep(0)}/>}
      {step === 2 && <Step3Details      order={order} setOrder={setOrder} onNext={() => handleSetStep(3)} onBack={() => handleSetStep(1)}/>}
      {step === 3 && <Step4Services     order={order} setOrder={setOrder} onNext={() => handleSetStep(4)} onBack={() => handleSetStep(2)}/>}
      {step === 4 && <Step5Completion   order={order} setStep={handleSetStep} onBack={() => handleSetStep(3)}/>}
      <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: '#aaa' }}>
        Need help? Call us at 605-787-3940
      </div>
    </div>
  )
}