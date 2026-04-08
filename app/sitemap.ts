import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://shorelineconcierge.travel'

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/affiliate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ]
}
