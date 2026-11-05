import '../styles/globals.css'
import Head from 'next/head'
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App({ Component, pageProps }) {
  const { metaTags, ...rest } = pageProps

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="google-site-verification" content="wJGArdQFFxsvl_09GnEoAe-lIy6qLGGIXOgKmbovjYI" />
        <meta property="og:site_name" content="PulseAI" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pulseai" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        
        {metaTags && Object.entries(metaTags).map(([property, content]) =>
          content ? <meta key={property} property={property} content={content} /> : null
        )}
      </Head>
      <Component {...rest} />
      <GoogleAnalytics gaId="G-58SE3HP4CP" />
    </>
  )
}
