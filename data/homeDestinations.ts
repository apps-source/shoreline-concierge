export type DestinationLinkItem = {
  name: string
  slug: string
  queryValue: string
  destinationId?: string
  priority: number
  subtitle?: string
  href: string
  imageSrc?: string
}

export type DestinationLinkGroup = {
  title: string
  description: string
  items: DestinationLinkItem[]
}

function buildCommonsImage(fileName: string, width = 1400) {
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=${width}`
}

function buildExperiencesHref(queryValue: string, destinationId?: string) {
  const params = new URLSearchParams()
  params.set('location', queryValue)
  if (destinationId) params.set('destination', destinationId)
  return `/experiences?${params.toString()}`
}

export const homeDestinationGroups: DestinationLinkGroup[] = [
  {
    title: 'Top Places',
    description: 'Popular beach destinations and coastal getaways travelers search when they want memorable activities near the water.',
    items: [
      { name: 'Myrtle Beach', slug: 'myrtle-beach', queryValue: 'Myrtle Beach', destinationId: '5217', priority: 1, subtitle: 'Boardwalk fun, family attractions, and beach-day staples.', href: buildExperiencesHref('Myrtle Beach', '5217'), imageSrc: buildCommonsImage('Myrtle Beach oceanfront.jpg') },
      { name: 'Clearwater', slug: 'clearwater', queryValue: 'Clearwater', destinationId: '22457', priority: 2, subtitle: 'Calm Gulf water, dolphin cruises, and sunset-friendly outings.', href: buildExperiencesHref('Clearwater', '22457'), imageSrc: buildCommonsImage('Clearwater Beach, Florida (35444518491).jpg') },
      { name: 'Virginia Beach', slug: 'virginia-beach', queryValue: 'Virginia Beach', priority: 3, subtitle: 'Classic coastal weekends with easy outdoor picks.', href: buildExperiencesHref('Virginia Beach'), imageSrc: buildCommonsImage('VB Oceanfront.jpg') },
      { name: 'Panama City Beach', slug: 'panama-city-beach', queryValue: 'Panama City Beach', destinationId: '22828', priority: 4, subtitle: 'Boat days, sandbars, and water adventures worth planning around.', href: buildExperiencesHref('Panama City Beach', '22828'), imageSrc: buildCommonsImage('Panama City Beach, Florida.jpg') },
      { name: '30A', slug: '30a', queryValue: '30A', priority: 5, subtitle: 'Scenic beach towns, laid-back luxury, and easy family options.', href: buildExperiencesHref('30A'), imageSrc: buildCommonsImage('Seaside, Florida.jpg') },
      { name: 'San Juan', slug: 'san-juan', queryValue: 'San Juan', priority: 6, subtitle: 'Historic streets, island water tours, and cruise-friendly excursions.', href: buildExperiencesHref('San Juan'), imageSrc: buildCommonsImage('Old San Juan, Puerto Rico.jpg') },
      { name: 'Maui', slug: 'maui', queryValue: 'Maui', destinationId: '671', priority: 7, subtitle: 'Snorkeling, sailing, and bucket-list island experiences.', href: buildExperiencesHref('Maui', '671'), imageSrc: buildCommonsImage('Maui Beach.jpg') },
      { name: 'Hilton Head', slug: 'hilton-head', queryValue: 'Hilton Head', priority: 8, subtitle: 'Relaxed Lowcountry escapes with nature, boating, and golf-town charm.', href: buildExperiencesHref('Hilton Head'), imageSrc: buildCommonsImage('Hilton Head Island beach.jpg') }
    ]
  },
  {
    title: 'Honorable Mentions',
    description: 'More coastal towns and waterfront cities worth browsing when you want ideas beyond the most-searched beach destinations.',
    items: [
      { name: 'Wilmington', slug: 'wilmington', queryValue: 'Wilmington, NC', priority: 1, subtitle: 'Riverfront charm, nearby beaches, and easy day plans.', href: buildExperiencesHref('Wilmington, NC'), imageSrc: buildCommonsImage('Wilmington Riverwalk.jpg') },
      { name: 'Gulf Shores / Orange Beach', slug: 'gulf-shores-orange-beach', queryValue: 'Gulf Shores', priority: 2, subtitle: 'Family beach trips, fishing charters, and sunshine-heavy getaways.', href: buildExperiencesHref('Gulf Shores'), imageSrc: buildCommonsImage('Orange Beach, Alabama.jpg') },
      { name: 'Nantucket', slug: 'nantucket', queryValue: 'Nantucket', priority: 3, subtitle: 'Harbor calm, bike rides, and polished seaside weekends.', href: buildExperiencesHref('Nantucket'), imageSrc: buildCommonsImage('Nantucket.jpg') },
      { name: 'Miami Beach', slug: 'miami-beach', queryValue: 'Miami Beach', priority: 4, subtitle: 'Boat parties, nightlife, and high-energy waterfront plans.', href: buildExperiencesHref('Miami Beach'), imageSrc: buildCommonsImage('SouthBeachMiamiBeach.jpg') },
      { name: 'Key West', slug: 'key-west', queryValue: 'Key West', priority: 5, subtitle: 'Sunset sails, sandbars, and easy island-day energy.', href: buildExperiencesHref('Key West'), imageSrc: buildCommonsImage('Gfp-florida-keys-key-west-looking-into-the-harbor.jpg') },
      { name: 'Fort Lauderdale', slug: 'fort-lauderdale', queryValue: 'Fort Lauderdale', destinationId: '660', priority: 6, subtitle: 'Yacht culture, canals, and warm-weather trip staples.', href: buildExperiencesHref('Fort Lauderdale', '660'), imageSrc: buildCommonsImage('Fort Lauderdale Beach (1).jpg') },
      { name: 'Ocean City', slug: 'ocean-city', queryValue: 'Ocean City', priority: 7, subtitle: 'Boardwalk favorites, beach classics, and family-first picks.', href: buildExperiencesHref('Ocean City'), imageSrc: buildCommonsImage('Ocean City Boardwalk 27.jpg') },
      { name: 'Daytona Beach', slug: 'daytona-beach', queryValue: 'Daytona Beach', priority: 8, subtitle: 'Easy Atlantic beach trips with simple, casual activities.', href: buildExperiencesHref('Daytona Beach'), imageSrc: buildCommonsImage('Daytona Beach, Florida.jpg') }
    ]
  }
]
