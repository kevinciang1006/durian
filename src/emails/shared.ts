export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailShell(bodyHtml: string): string {
  return `<div style="background:#F7F2E7;padding:32px 16px;font-family:Karla,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFCF5;border:1px solid rgba(138,106,36,0.2);border-radius:16px;padding:32px;">
      ${bodyHtml}
    </div>
  </div>`;
}
