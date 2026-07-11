import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const serif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif-loaded',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans-loaded',
  display: 'swap',
})

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adeel — Direct Response Video Editor',
    description:
      'Direct Response editor for high-ticket offers. $1.5M/mo ad spend. 300+ projects. 5 years.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
