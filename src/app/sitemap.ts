import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://hseroyalrumble.com',
      lastModified: new Date(),
    },
  ]
}
