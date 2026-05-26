import type { Metadata } from 'next'
import { Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={instrumentSerif.variable}>
        {children}
      </body>
    </html>
  )
}
