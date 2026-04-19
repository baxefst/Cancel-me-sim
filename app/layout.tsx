import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cancel Me Simulator',
  description: 'The internet is watching.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <div className="crt-scanlines" id="scanlines" />
        <div className="crt-vignette" />
      </body>
    </html>
  )
}
