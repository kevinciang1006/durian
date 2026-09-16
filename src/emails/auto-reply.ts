import { waLink } from '../config';
import { escapeHtml, emailShell } from './shared';

export interface AutoReplyData {
  name: string;
  locale: 'id' | 'en';
}

const copy = {
  en: {
    subject: 'Thank you for contacting Durian Sriraja',
    greeting: (name: string) => `Hi ${name},`,
    body1:
      "Thank you for reaching out to Durian Sriraja. We've received your message and someone from our family will get back to you soon.",
    body2: 'For a faster response, you can also message us directly on WhatsApp.',
    cta: 'Message us on WhatsApp',
    signOff: 'Warm regards,',
    signature: 'The Durian Sriraja Family — Bukit Lawang, North Sumatra',
    waMessage: "Hi, I just filled out the contact form on your website",
  },
  id: {
    subject: 'Terima kasih telah menghubungi Durian Sriraja',
    greeting: (name: string) => `Halo ${name},`,
    body1:
      'Terima kasih telah menghubungi Durian Sriraja. Pesan Anda sudah kami terima dan keluarga kami akan segera membalas.',
    body2: 'Untuk respons lebih cepat, Anda juga bisa menghubungi kami langsung via WhatsApp.',
    cta: 'Hubungi via WhatsApp',
    signOff: 'Salam hangat,',
    signature: 'Keluarga Durian Sriraja — Bukit Lawang, Sumatera Utara',
    waMessage: 'Halo, saya baru saja mengisi formulir kontak di website Anda',
  },
} as const;

export function autoReplyEmail(data: AutoReplyData): { subject: string; html: string; text: string } {
  const c = copy[data.locale];
  const whatsappHref = waLink(c.waMessage);

  const html = emailShell(`
    <h1 style="font-family:Georgia,serif;color:#1C3327;font-size:22px;margin:0 0 20px;">${escapeHtml(c.subject)}</h1>
    <p style="color:#1F1E1B;font-size:15px;line-height:1.7;margin:0 0 16px;">${escapeHtml(c.greeting(data.name))}</p>
    <p style="color:#1F1E1B;font-size:15px;line-height:1.7;margin:0 0 16px;">${escapeHtml(c.body1)}</p>
    <p style="color:#1F1E1B;font-size:15px;line-height:1.7;margin:0 0 24px;">${escapeHtml(c.body2)}</p>
    <a href="${whatsappHref}" style="display:inline-block;background:#C8963E;color:#14251C;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(c.cta)}</a>
    <p style="color:#1F1E1B;font-size:14px;line-height:1.7;margin:32px 0 0;">${escapeHtml(c.signOff)}<br/>${escapeHtml(c.signature)}</p>
  `);

  const text = [
    c.greeting(data.name),
    '',
    c.body1,
    c.body2,
    '',
    `${c.cta}: ${whatsappHref}`,
    '',
    c.signOff,
    c.signature,
  ].join('\n');

  return { subject: c.subject, html, text };
}
