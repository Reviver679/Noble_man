import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { UploadProvider } from '@/lib/uploadContext'
import AnnouncementBar from '@/components/home/AnnouncementBar'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Nobilified - See Yourself as Royalty. Free Preview, No Credit Card.',
  description: 'Become a timeless masterpiece. Upload your photo and get an instant AI-generated 18th-century oil portrait. Download digital or order a hand-painted print.',
  generator: 'v0.app',
  icons: {
    icon: '/nobilified_favicon.png',
    shortcut: '/nobilified_favicon.png',
    apple: '/nobilified_favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased dark" suppressHydrationWarning>
        <I18nProvider>
          <UploadProvider>
            <AnnouncementBar />
            {children}
          </UploadProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
