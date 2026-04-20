export function extractTextFromBase64Document(base64: string, fileName?: string) {
  const buffer = Buffer.from(base64, 'base64');
  const extension = fileName?.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    return buffer.toString('utf-8');
  }

  const raw = buffer.toString('latin1');
  const literalMatches = raw.match(/\(([^()]{2,200})\)/g) ?? [];
  const hexMatches = raw.match(/<([0-9A-Fa-f\s]{6,})>/g) ?? [];

  const decodedHex = hexMatches
    .map((segment) => segment.slice(1, -1).replace(/\s+/g, ''))
    .map((segment) => {
      try {
        return Buffer.from(segment, 'hex').toString('utf-8');
      } catch {
        return '';
      }
    })
    .join(' ');

  const cleaned = [literalMatches.map((segment) => segment.slice(1, -1)).join(' '), decodedHex]
    .join(' ')
    .replace(/\\[rn]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > 80) {
    return cleaned;
  }

  return raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
}
