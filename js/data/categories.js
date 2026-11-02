// ==========================================================================
// SHUTTERVERSE CATEGORIES & REALM TAXONOMY
// Modern Photography (16) + History & Heritage (3 Pillars) + Sacred Art (13)
// ==========================================================================

export const REALMS = [
  {
    id: 'all',
    name: 'Complete Archive',
    shortName: 'Complete',
    tagline: 'Modern master photography, world history & sacred cultural heritage'
  },
  {
    id: 'photography',
    name: 'Modern Photography',
    shortName: 'Photography',
    tagline: 'Contemporary international photography across 16 fine art disciplines'
  },
  {
    id: 'heritage',
    name: 'History & Heritage',
    shortName: 'History & Heritage',
    tagline: 'Indian history, ancient empires, royal portraits & world archaeological heritage'
  },
  {
    id: 'sacred-art',
    name: 'Sacred Art & Indian Mythology',
    shortName: 'Sacred Art',
    tagline: 'Devotional Hindu iconography, temple architecture & classical Indian masterworks'
  }
];

export const MODERN_CATEGORIES = [
  { id: 'cinematic', name: 'Cinematic Photography', realm: 'photography', count: 14 },
  { id: 'luxury-lifestyle', name: 'Luxury Lifestyle', realm: 'photography', count: 12 },
  { id: 'fashion', name: 'Fashion Editorial', realm: 'photography', count: 18 },
  { id: 'glamour', name: 'Glamour Photography', realm: 'photography', count: 11 },
  { id: 'portrait', name: 'Portrait Photography', realm: 'photography', count: 16 },
  { id: 'street', name: 'Street Photography', realm: 'photography', count: 13 },
  { id: 'travel', name: 'Travel Photography', realm: 'photography', count: 14 },
  { id: 'nature', name: 'Nature Photography', realm: 'photography', count: 12 },
  { id: 'landscape', name: 'Landscape Photography', realm: 'photography', count: 16 },
  { id: 'architecture', name: 'Architecture Photography', realm: 'photography', count: 15 },
  { id: 'interior', name: 'Interior Photography', realm: 'photography', count: 10 },
  { id: 'product', name: 'Product Photography', realm: 'photography', count: 11 },
  { id: 'macro', name: 'Macro Photography', realm: 'photography', count: 9 },
  { id: 'vintage', name: 'Vintage Photography', realm: 'photography', count: 12 },
  { id: 'black-and-white', name: 'Black & White Photography', realm: 'photography', count: 17 },
  { id: 'fine-art', name: 'Fine Art Photography', realm: 'photography', count: 14 }
];

export const HERITAGE_SECTIONS = [
  {
    pillar: 'Indian History',
    categories: [
      'Ancient Indian Civilizations',
      'Indus Valley Civilization',
      'Maurya Empire',
      'Gupta Empire',
      'Mughal Empire',
      'Rajput Kingdoms',
      'Maratha History',
      'Indian Royal Families',
      'Historical Indian Architecture',
      'Indian Freedom Movement'
    ]
  },
  {
    pillar: 'Kings & Queens',
    categories: [
      'Indian Kings and Maharajas',
      'Indian Queens and Maharanis',
      'Mughal Emperors',
      'Rajput Royal Families',
      'European Kings and Queens',
      'Egyptian Pharaohs',
      'Roman Emperors',
      'Japanese Emperors',
      'Historical Royal Portraits'
    ]
  },
  {
    pillar: 'World History',
    categories: [
      'Ancient Egypt',
      'Ancient Greece',
      'Ancient Rome',
      'Medieval Europe',
      'Ancient China',
      'Japanese History',
      'Persian Empire',
      'Ottoman Empire',
      'Historical World Photography'
    ]
  }
];

export const SACRED_ART_CATEGORIES = [
  { id: 'lord-shiva', name: 'Lord Shiva', realm: 'sacred-art', count: 8 },
  { id: 'lord-vishnu', name: 'Lord Vishnu', realm: 'sacred-art', count: 7 },
  { id: 'lord-krishna', name: 'Lord Krishna', realm: 'sacred-art', count: 9 },
  { id: 'lord-rama', name: 'Lord Rama', realm: 'sacred-art', count: 8 },
  { id: 'lord-ganesha', name: 'Lord Ganesha', realm: 'sacred-art', count: 6 },
  { id: 'goddess-durga', name: 'Goddess Durga', realm: 'sacred-art', count: 7 },
  { id: 'goddess-lakshmi', name: 'Goddess Lakshmi', realm: 'sacred-art', count: 6 },
  { id: 'goddess-saraswati', name: 'Goddess Saraswati', realm: 'sacred-art', count: 5 },
  { id: 'hanuman-ji', name: 'Hanuman Ji', realm: 'sacred-art', count: 6 },
  { id: 'temple-art', name: 'Traditional Hindu Temple Art', realm: 'sacred-art', count: 12 },
  { id: 'ancient-sculptures', name: 'Ancient Indian Sculptures', realm: 'sacred-art', count: 14 },
  { id: 'traditional-paintings', name: 'Traditional Indian Paintings', realm: 'sacred-art', count: 11 },
  { id: 'mythological-artwork', name: 'Mythological Artwork', realm: 'sacred-art', count: 10 }
];

// Unified categories for horizontal scroller & dynamic filters
export const ALL_CATEGORIES = [
  { id: 'all', name: 'All Masterworks', realm: 'all' },
  ...MODERN_CATEGORIES,
  { id: 'indus-valley', name: 'Indus Valley & Ancient India', realm: 'heritage' },
  { id: 'maurya-empire', name: 'Maurya & Gupta Empires', realm: 'heritage' },
  { id: 'mughal-empire', name: 'Mughal & Rajput Eras', realm: 'heritage' },
  { id: 'maratha-history', name: 'Maratha History', realm: 'heritage' },
  { id: 'indian-royalty', name: 'Indian Kings & Maharanis', realm: 'heritage' },
  { id: 'freedom-movement', name: 'Indian Freedom Movement', realm: 'heritage' },
  { id: 'ancient-world', name: 'Ancient Egypt, Greece & Rome', realm: 'heritage' },
  ...SACRED_ART_CATEGORIES
];
