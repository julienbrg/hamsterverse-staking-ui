import React from 'react'
import { default as NextHead } from 'next/head'
import { SITE_URL } from '../../utils/config'

interface Props {
  title?: string
  description?: string
}

export function Head({ title, description }: Props) {
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : SITE_URL
  const img = `https://bafkreicctn5ua3ctzctk62d4vpbsvipzlakdja4hzgh2nkwwauayrf76iy.ipfs.w3s.link/`

  return (
    <NextHead>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={origin} />
      <meta name="twitter:card" content={img} />
      <meta name="twitter:site" content="@W3HC8" />
      <meta name="twitter:title" content="Hamsterverse" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </NextHead>
  )
}
