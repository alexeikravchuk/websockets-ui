import * as crypto from 'crypto';

export const getUUID = (): string => {
  const buf = crypto.randomBytes(16);
  buf[6] = (buf[6]! & 0x0f) | 0x40;
  buf[8] = (buf[8]! & 0x3f) | 0x80;
  return buf.toString('hex').match(/.{8}/g)!.join('-');
}
