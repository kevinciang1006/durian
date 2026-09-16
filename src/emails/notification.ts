import { escapeHtml, emailShell } from './shared';

export interface NotificationEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  message: string;
  locale: 'id' | 'en';
}

export function notificationEmail(data: NotificationEmailData): { html: string; text: string } {
  const rows: [string, string][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company || '—'],
    ['Phone / WhatsApp', data.phone || '—'],
    ['Country', data.country || '—'],
    ['Locale', data.locale === 'id' ? 'Indonesian (id)' : 'English (en)'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#8A6A24;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1F1E1B;font-size:14px;">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  const html = emailShell(`
    <h1 style="font-family:Georgia,serif;color:#1C3327;font-size:22px;margin:0 0 20px;">New inquiry from Durian Sriraja website</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${rowsHtml}</table>
    <div style="border-top:1px solid rgba(138,106,36,0.2);padding-top:16px;">
      <p style="color:#8A6A24;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Message</p>
      <p style="color:#1F1E1B;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0;">${escapeHtml(data.message)}</p>
    </div>
  `);

  const text = [
    'New inquiry from Durian Sriraja website',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    data.message,
  ].join('\n');

  return { html, text };
}
