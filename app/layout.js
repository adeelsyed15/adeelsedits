import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Single sans stack — Inter across the board. No wedding-y serifs.
const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans-loaded',
  display: 'swap',
})

// Alias for backwards compatibility — --font-serif still exists but resolves to Inter
const serif = { variable: '--font-serif-loaded-noop' }

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-loaded',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://adeelsedits.com'),
  title: 'Adeel — Direct Response Video Editor for High-Ticket Offers',
  description:
    'I cut ads, VSLs, and product videos that move serious money — for premium offers in digital assets, trading, AI automation, EdTech, FinTech, and wealth.',
  openGraph: {
    title: 'Adeel — Direct Response Video Editor for High-Ticket Offers',
    description:
      'Ads, VSLs, and product videos for premium offers in digital assets, trading, AI automation, EdTech, FinTech, and wealth.',
    url: 'https://adeelsedits.com',
    siteName: 'Adeel',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Adeel — Direct Response Video Editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adeel — Direct Response Video Editor',
    description:
      'Direct Response editor for high-ticket offers. $1.5M/mo ad spend. 300+ projects. 5 years.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
