import './globals.css'

export const metadata = {
  title: 'West River Funeral Directors',
  description: 'Compassionate funeral services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
