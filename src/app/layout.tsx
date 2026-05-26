import type { Metadata } from 'next'
import { Lora, DM_Mono } from 'next/font/google'
import '@/styles/globals.css'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${lora.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
