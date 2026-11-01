import '../styles/globals.css'
import Head from 'next/head'
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Open Graph defaults */}
        <meta property="og:site_name" content="PulseAI" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter defaults */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pulseai" />
      </Head>
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-58SE3HP4CP" />
    </>
  )
}
