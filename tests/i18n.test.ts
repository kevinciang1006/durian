import { describe, it, expect } from 'vitest';
import { getLangFromUrl, getLocalizedPath, getVarietyPath } from '../src/i18n/utils';

describe('getLangFromUrl', () => {
  it('detects English from the /en/ prefix', () => {
    expect(getLangFromUrl(new URL('https://duriansriraja.com/en/varieties/'))).toBe('en');
  });

  it('defaults to Indonesian for non-/en/ paths', () => {
    expect(getLangFromUrl(new URL('https://duriansriraja.com/varietas/'))).toBe('id');
  });
});

describe('getLocalizedPath', () => {
  it('maps each route key to its locale-specific path', () => {
    expect(getLocalizedPath('home', 'id')).toBe('/');
    expect(getLocalizedPath('home', 'en')).toBe('/en/');
    expect(getLocalizedPath('varieties', 'id')).toBe('/varietas/');
    expect(getLocalizedPath('varieties', 'en')).toBe('/en/varieties/');
    expect(getLocalizedPath('story', 'id')).toBe('/cerita-kami/');
    expect(getLocalizedPath('story', 'en')).toBe('/en/our-story/');
    expect(getLocalizedPath('export', 'id')).toBe('/ekspor/');
    expect(getLocalizedPath('export', 'en')).toBe('/en/export/');
    expect(getLocalizedPath('contact', 'id')).toBe('/kontak/');
    expect(getLocalizedPath('contact', 'en')).toBe('/en/contact/');
  });
});

describe('getVarietyPath', () => {
  it('builds locale-specific variety detail URLs', () => {
    expect(getVarietyPath('musang-king', 'id')).toBe('/varietas/musang-king/');
    expect(getVarietyPath('musang-king', 'en')).toBe('/en/varieties/musang-king/');
  });
});
