import './globals.css'

export const metadata = {
  title: 'West River Funeral Directors',
  description: 'Compassionate funeral services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
