import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Fraunces } from 'next/font/google'
import '@/styles/globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-editorial',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geist.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  )
}
