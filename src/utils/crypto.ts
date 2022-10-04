import crypto from 'crypto';

export function sha256b64(str: string): string {
  return crypto.createHash('sha256').update(str).digest('base64');
}
