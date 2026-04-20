export function extractTextFromBase64Document(base64: string, fileName?: string) {
  const buffer = Buffer.from(base64, 'base64');
  const extension = fileName?.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    return buffer.toString('utf-8');
  }

  const raw = buffer.toString('latin1');
  const matches = raw.match(/\(([^()]{2,200})\)/g) ?? [];
  const cleaned = matches
    .map((segment) => segment.slice(1, -1))
    .join(' ')
    .replace(/\\[rn]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > 80) {
    return cleaned;
  }

  return raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
}
