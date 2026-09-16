import type { Locale } from './utils';

export const meta = {
  id: {
    home: {
      title: 'Durian Sriraja — Durian Premium Bukit Lawang, Sumatera Utara',
      description:
        'Durian premium langsung dari kebun keluarga di Bukit Lawang. Musang King, Black Thorn, Monthong — segar dari pohon. Pesan via WhatsApp.',
    },
    varieties: {
      title: 'Jenis Durian Premium Kami | Durian Sriraja Bukit Lawang',
      description:
        'Lihat jenis durian premium dari kebun kami di Bukit Lawang: Musang King, Black Thorn, Monthong, Sultan, dan Chanee. Segar dari kebun.',
    },
    story: {
      title: 'Cerita Kami — Kebun Durian di Rimba Bukit Lawang',
      description:
        'Dari tempat retret mindfulness ke kebun durian 8 hektar di Bukit Lawang. Kisah keluarga Durian Sriraja menanam durian premium sejak 2021.',
    },
    international: {
      title: 'Pembeli Internasional — Durian Premium Indonesia | Sriraja',
      description:
        'Pembeli dan mitra luar negeri: kunjungi kebun kami di Bukit Lawang, cicipi langsung, atau diskusikan kemitraan durian premium jangka panjang.',
    },
    contact: {
      title: 'Kontak & Kunjungan Kebun | Durian Sriraja Bukit Lawang',
      description:
        'Hubungi Durian Sriraja via WhatsApp untuk pesan durian premium atau atur kunjungan ke kebun kami di Bukit Lawang, Langkat, Sumatera Utara.',
    },
  },
  en: {
    home: {
      title: 'Durian Sriraja — Premium Durian Farm in Bukit Lawang',
      description:
        'Premium durian straight from our family farm in the Bukit Lawang rainforest, North Sumatra. Musang King, Black Thorn & more. Order via WhatsApp.',
    },
    varieties: {
      title: 'Our Premium Durian Varieties | Durian Sriraja',
      description:
        'Explore the premium durian we grow in Bukit Lawang: Musang King, Black Thorn, Monthong, Sultan, and Chanee. Fresh from our family farm.',
    },
    story: {
      title: 'Our Story — A Durian Orchard in the Bukit Lawang Jungle',
      description:
        'From a mindfulness retreat to an 8-hectare durian orchard in Bukit Lawang. The family story of Durian Sriraja, growing premium durian since 2021.',
    },
    international: {
      title: 'For International Buyers | Durian Sriraja, North Sumatra',
      description:
        'Overseas buyers & partners: visit our Bukit Lawang farm, taste our premium durian, or discuss long-term supply from North Sumatra, Indonesia.',
    },
    contact: {
      title: 'Contact & Farm Visits | Durian Sriraja Bukit Lawang',
      description:
        'Contact Durian Sriraja on WhatsApp to order premium durian or arrange a visit to our farm in Bukit Lawang, Langkat, North Sumatra.',
    },
  },
} as const;

export function varietyMeta(lang: Locale, data: { name: string; tagline: string; origin: string }) {
  const title =
    lang === 'id'
      ? `${data.name} — Durian Premium Bukit Lawang | Durian Sriraja`
      : `${data.name} Durian — Premium from Bukit Lawang | Durian Sriraja`;
  return { title, description: `${data.tagline} — ${data.origin}` };
}
