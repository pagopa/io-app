import { randomUUID } from "crypto";

import { ioDevServerConfig } from "../../config";

const QTSP_NONCE_EXPIRING_MS =
  ioDevServerConfig.messages.fci.response.nonceDurationSeconds * 1000;

const qtspNonceExpirations = new Map<string, Date>();

const cleanupExpiredQtspNonces = () => {
  const now = new Date();
  qtspNonceExpirations.forEach((expiresAt, nonce) => {
    if (expiresAt <= now) {
      qtspNonceExpirations.delete(nonce);
    }
  });
};

const generateQtspNonce = () =>
  `devnonce-${randomUUID({ disableEntropyCache: true })}`;

export const generateAndStoreQtspNonce = (now = new Date()) => {
  cleanupExpiredQtspNonces();
  const nonce = generateQtspNonce();
  qtspNonceExpirations.set(
    nonce,
    new Date(now.getTime() + QTSP_NONCE_EXPIRING_MS)
  );
  return nonce;
};

export const validateQtspNonce = (nonce: string): boolean => {
  cleanupExpiredQtspNonces();
  const expiration = qtspNonceExpirations.get(nonce);
  return expiration !== undefined;
};

export const getQtspNonceExpirations = () => qtspNonceExpirations;
