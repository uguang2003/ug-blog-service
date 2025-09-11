import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UG Blog Service',
  description: 'UG的Blog后端服务',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
