import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { notificationEmail } from '../../emails/notification';
import { autoReplyEmail } from '../../emails/auto-reply';

export const prerender = false;

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Please enter a valid email address'),
  company: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  country: z.string().trim().optional().default(''),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long'),
  locale: z.enum(['id', 'en']),
  website: z.string().optional().default(''),
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  // Honeypot check runs before schema validation: a bot that fills every
  // field with garbage should still get a silent 200, not a 400.
  const honeypot = (body as Record<string, unknown> | null)?.website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return json({ ok: false, fieldErrors: result.error.flatten().fieldErrors }, 400);
  }

  const data = result.data;

  const apiKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    console.error('Contact form: missing RESEND_API_KEY, CONTACT_FROM_EMAIL, or CONTACT_TO_EMAIL');
    return json({ ok: false, error: 'Server is not configured to send messages right now' }, 500);
  }

  const resend = new Resend(apiKey);

  try {
    const notification = notificationEmail(data);
    const autoReply = autoReplyEmail({ name: data.name, locale: data.locale });

    await Promise.all([
      resend.emails.send({
        from: `Durian Sriraja Website <${fromEmail}>`,
        to: toEmail,
        replyTo: data.email,
        subject: `New inquiry from ${data.name} — Durian Sriraja`,
        html: notification.html,
        text: notification.text,
      }),
      resend.emails.send({
        from: `Durian Sriraja <${fromEmail}>`,
        to: data.email,
        subject: autoReply.subject,
        html: autoReply.html,
        text: autoReply.text,
      }),
    ]);

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('Contact form: failed to send emails via Resend', err);
    return json({ ok: false, error: 'Failed to send your message. Please try again.' }, 500);
  }
};
