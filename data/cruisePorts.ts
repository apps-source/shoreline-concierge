import type { DestinationLinkItem } from './homeDestinations'

export type CruisePortGroup = {
  title: string
  description: string
  items: DestinationLinkItem[]
}

function buildCruiseHref(queryValue: string, destinationId?: string) {
  const params = new URLSearchParams()
  params.set('location', queryValue)
  params.set('category', 'cruise-excursions')
  if (destinationId) params.set('destination', destinationId)
  return `/experiences?${params.toString()}`
}

function buildCommonsImage(fileName: string, width = 1400) {
  return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=${width}`
}

export const cruisePortGroups: CruisePortGroup[] = [
  {
    title: 'Top Ports',
    description: 'Popular ports where travelers often want easy, memorable shore-day experiences that fit a cruise schedule.',
    items: [
      { name: 'Nassau', slug: 'nassau', queryValue: 'Nassau', destinationId: '420', priority: 1, subtitle: 'Beach clubs, snorkeling, and classic Bahamas port-day options.', href: buildCruiseHref('Nassau', '420'), imageSrc: buildCommonsImage('Nassau Harbor 2024.jpg') },
      { name: 'Cozumel', slug: 'cozumel', queryValue: 'Cozumel', destinationId: '632', priority: 2, subtitle: 'Reefs, catamarans, beach breaks, and easy island-day picks.', href: buildCruiseHref('Cozumel', '632'), imageSrc: buildCommonsImage('East Coast (Beach in Cozumel).jpg') },
      { name: 'Costa Maya', slug: 'costa-maya', queryValue: 'Costa Maya', priority: 3, subtitle: 'Ruins, beach clubs, and low-stress port excursions.', href: buildCruiseHref('Costa Maya'), imageSrc: buildCommonsImage('Cruise Port Costa Maya Quintana Roo 2023.jpg') },
      { name: 'Grand Turk', slug: 'grand-turk', queryValue: 'Grand Turk', priority: 4, subtitle: 'Clear water, snorkeling, and quick island highlights.', href: buildCruiseHref('Grand Turk'), imageSrc: buildCommonsImage('Turks and Caicos Islands - Grand Turk - Beach (14788700443).jpg') },
      { name: 'Roatán', slug: 'roatan', queryValue: 'Roatán', priority: 5, subtitle: 'Reef adventures, wildlife stops, and beach-day classics.', href: buildCruiseHref('Roatán'), imageSrc: buildCommonsImage('Roatan beach.JPG') },
      { name: 'St. Thomas', slug: 'st-thomas', queryValue: 'St. Thomas', destinationId: '965', priority: 6, subtitle: 'Sailing, shopping, viewpoints, and island hopping.', href: buildCruiseHref('St. Thomas', '965'), imageSrc: buildCommonsImage('St Thomas harbor.jpg') },
      { name: 'San Juan', slug: 'san-juan', queryValue: 'San Juan', priority: 7, subtitle: 'Old San Juan sightseeing, food, and nearby water activities.', href: buildCruiseHref('San Juan'), imageSrc: buildCommonsImage('Old San Juan, Puerto Rico.jpg') },
      { name: 'Puerto Plata', slug: 'puerto-plata', queryValue: 'Puerto Plata', priority: 8, subtitle: 'Beach clubs, waterfalls, and north-coast day trips.', href: buildCruiseHref('Puerto Plata'), imageSrc: buildCommonsImage('Shore at Puerto Plata - Dominican Republic.jpg') },
      { name: 'Falmouth', slug: 'falmouth', queryValue: 'Falmouth', priority: 9, subtitle: 'Jamaica shore days with rafting, beach time, and sightseeing.', href: buildCruiseHref('Falmouth'), imageSrc: buildCommonsImage('Falmouth, Jamaica.jpg') },
      { name: 'George Town', slug: 'george-town', queryValue: 'George Town, Grand Cayman', priority: 10, subtitle: 'Stingray, reef, and beach excursions with easy port access.', href: buildCruiseHref('George Town, Grand Cayman'), imageSrc: buildCommonsImage('Waterfront, George Town, Grand Cayman.jpg') },
      { name: 'Key West', slug: 'key-west', queryValue: 'Key West', priority: 11, subtitle: 'Short-stop island experiences, snorkel trips, and sunset-friendly options.', href: buildCruiseHref('Key West'), imageSrc: buildCommonsImage('Gfp-florida-keys-key-west-looking-into-the-harbor.jpg') },
      { name: 'Port Canaveral', slug: 'port-canaveral', queryValue: 'Port Canaveral', priority: 12, subtitle: 'Pre- and post-cruise activities plus easy coastal add-ons.', href: buildCruiseHref('Port Canaveral'), imageSrc: buildCommonsImage('Sunset - Port Canaveral.jpg') }
    ]
  },
  {
    title: 'Honorable Mentions',
    description: 'More cruise stops that are worth having in your back pocket when you want to plan a smoother, more memorable port day.',
    items: [
      { name: 'Ocho Rios', slug: 'ocho-rios', queryValue: 'Ocho Rios', priority: 1, subtitle: 'Waterfalls, river outings, and beach-day add-ons.', href: buildCruiseHref('Ocho Rios'), imageSrc: buildCommonsImage('Town of Ocho Rios.JPG') },
      { name: 'Montego Bay', slug: 'montego-bay', queryValue: 'Montego Bay', destinationId: '432', priority: 2, subtitle: 'Beach clubs, rum stops, and Jamaica highlights.', href: buildCruiseHref('Montego Bay', '432'), imageSrc: buildCommonsImage('MontegoBay.jpg') },
      { name: 'St. Maarten', slug: 'st-maarten', queryValue: 'St. Maarten', priority: 3, subtitle: 'Island sightseeing, beach hopping, and catamaran favorites.', href: buildCruiseHref('St. Maarten'), imageSrc: buildCommonsImage('Saint Maarten.jpg') },
      { name: 'Antigua', slug: 'antigua', queryValue: 'Antigua', priority: 4, subtitle: 'Scenic coastal drives, beach days, and harbor sailing.', href: buildCruiseHref('Antigua'), imageSrc: buildCommonsImage('Falmouth Harbour, Antigua.jpg') },
      { name: 'Belize City', slug: 'belize-city', queryValue: 'Belize City', priority: 5, subtitle: 'Ruins, reef trips, and inland adventure port days.', href: buildCruiseHref('Belize City'), imageSrc: buildCommonsImage('Belize City Harbor.jpg') },
      { name: 'Labadee', slug: 'labadee', queryValue: 'Labadee', priority: 6, subtitle: 'Beach-forward cruise stops with simple excursion planning.', href: buildCruiseHref('Labadee'), imageSrc: buildCommonsImage('Labadee, Haiti.jpg') },
      { name: 'CocoCay', slug: 'cococay', queryValue: 'CocoCay', priority: 7, subtitle: 'Quick-hit beach fun, water attractions, and easy island time.', href: buildCruiseHref('CocoCay'), imageSrc: buildCommonsImage('CocoCay Bahamas 2024.jpg') },
      { name: 'Miami', slug: 'miami', queryValue: 'Miami', priority: 8, subtitle: 'Cruise embarkation city add-ons, tours, and waterfront plans.', href: buildCruiseHref('Miami'), imageSrc: buildCommonsImage('Miami, FL Skyline.jpg') },
      { name: 'New Orleans', slug: 'new-orleans', queryValue: 'New Orleans', priority: 9, subtitle: 'Pre- and post-cruise city experiences with coastal access.', href: buildCruiseHref('New Orleans'), imageSrc: buildCommonsImage('USACE New Orleans skyline.jpg') }
    ]
  }
]
