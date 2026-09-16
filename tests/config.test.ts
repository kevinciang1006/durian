import { describe, it, expect } from 'vitest';
import { waLink, WHATSAPP_NUMBER } from '../src/config';

describe('waLink', () => {
  it('builds a wa.me URL with the configured number', () => {
    expect(waLink('hello')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=hello`);
  });

  it('URL-encodes commas, spaces, and punctuation', () => {
    const url = waLink('Halo, saya tertarik dengan Musang King');
    expect(url).toBe(
      `https://wa.me/${WHATSAPP_NUMBER}?text=Halo%2C%20saya%20tertarik%20dengan%20Musang%20King`
    );
  });
});
