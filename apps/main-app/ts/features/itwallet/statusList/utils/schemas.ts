import { z } from "zod";

/**
 * Schema for the `status_list` object within a Status List Token payload.
 *
 * @see https://italia.github.io/eid-wallet-it-docs/releases/1.3.3/en/credential-revocation.html#status-list-token
 */
const StatusListSchema = z.object({
  // Number of bits per credential in the compressed byte array; spec allows 1, 2, 4 or 8.
  bits: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8)]),
  // base64url-encoded compressed byte array carrying the status of every credential.
  lst: z.string().min(1),
  aggregation_uri: z.url().optional()
});

/**
 * Schema for a decoded Status List Token payload.
 * Mirrors the claims defined by the IT-Wallet credential revocation specification:
 * `sub` and `iat` are REQUIRED, while `exp` and `ttl` are RECOMMENDED (optional).
 * `ttl` (seconds) is retained for spec fidelity even though cache staleness is
 * derived from `exp`/`iat`.
 *
 * @see https://italia.github.io/eid-wallet-it-docs/releases/1.3.3/en/credential-revocation.html#status-list-token
 */
export const StatusListPayloadSchema = z.object({
  sub: z.url(),
  iat: z.number().int().positive(),
  exp: z.number().int().positive().optional(),
  ttl: z.number().int().positive().optional(),
  status_list: StatusListSchema
});

export type StatusListPayload = z.infer<typeof StatusListPayloadSchema>;

/**
 * Validates that a fetched payload's `sub` matches the expected URI.
 * Prevents storing a token under the wrong cache identity.
 */
export const validatePayloadSub = (
  payload: StatusListPayload,
  expectedUri: string
): boolean => payload.sub === expectedUri;
