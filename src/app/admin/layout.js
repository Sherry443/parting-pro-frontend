'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Cases' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/questions', label: 'Questions' },
]

export default function AdminLayout({ children }) {
  const path = usePathname()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <div style={{ background: '#1a2e3a', color: '#fff', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 40 }}>
          <div style={{ background: '#2c4a5a', borderRadius: 6, padding: '4px 10px', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>⚙ Parting Pro</div>
        </div>
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            style={{
              padding: '0 20px',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: path === n.href ? '#fff' : '#8ab4c4',
              textDecoration: 'none',
              borderBottom: path === n.href ? '3px solid #4a9ab4' : '3px solid transparent',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all .2s',
            }}
          >
            {n.label}
          </Link>
        ))}
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#8ab4c4' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2c4a5a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>D</div>
          Dean Moncur ▾
        </div>
      </div>
      <div style={{ flex: 1, background: '#f0f2f5' }}>
        {children}
      </div>
    </div>
  )
}
