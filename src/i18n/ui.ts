export type Locale = 'id' | 'en';

export const languages = { id: 'ID', en: 'EN' } as const;

export const ui = {
  id: {
    nav: {
      home: 'Beranda',
      varieties: 'Varietas',
      story: 'Cerita Kami',
      export: 'Ekspor',
      contact: 'Kontak',
    },
    whatsapp: {
      generic: 'Halo, saya tertarik dengan durian dari Kebun Sriraja',
      variety: (name: string) => `Halo, saya tertarik dengan ${name}`,
      partnership: 'Halo, saya ingin menjajaki kemitraan/ekspor dengan Kebun Sriraja',
    },
    footer: {
      blurb:
        'Durian premium dari kebun keluarga di Bukit Lawang, Sumatera Utara. Ditanam dengan sabar, dipanen langsung dari pohon.',
      rights: 'Hak cipta dilindungi.',
      navigate: 'Navigasi',
      language: 'Bahasa',
    },
    ctaOrder: 'Pesan via WhatsApp',
    ctaBrowse: 'Lihat Jenis Durian',
  },
  en: {
    nav: {
      home: 'Home',
      varieties: 'Varieties',
      story: 'Our Story',
      export: 'Export',
      contact: 'Contact',
    },
    whatsapp: {
      generic: "Hi, I'm interested in durian from Sriraja Farm",
      variety: (name: string) => `Hi, I'm interested in ${name}`,
      partnership: "Hi, I'd like to discuss an export/partnership opportunity with Sriraja Farm",
    },
    footer: {
      blurb:
        'Premium durian from a family orchard in Bukit Lawang, North Sumatra. Grown with patience, harvested straight from the tree.',
      rights: 'All rights reserved.',
      navigate: 'Navigate',
      language: 'Language',
    },
    ctaOrder: 'Order via WhatsApp',
    ctaBrowse: 'View Varieties',
  },
} as const;
