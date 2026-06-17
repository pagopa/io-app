import { z } from "zod";

/**
 * Schema for the `status_list` field within a Status List Token payload.
 * Contains the compressed bitstring and metadata needed to verify credential status.
 */
const StatusListSchema = z.object({
  bits: z.number().int().positive(),
  lst: z.string(),
  aggregation_uri: z.url().optional()
});

/**
 * Schema for a decoded Status List Token payload.
 * Follows the IT-Wallet credential revocation specification.
 *
 * @see https://italia.github.io/eid-wallet-it-docs/releases/1.3.3/en/credential-revocation.html
 */
export const StatusListPayloadSchema = z.object({
  sub: z.url(),
  exp: z.number().int().positive().optional(),
  iat: z.number().int().positive().optional(),
  ttl: z.number().int().positive().optional(),
  status_list: StatusListSchema
});

/**
 * Schema for a persisted Status List Token entry.
 * Contains the decoded payload and cache metadata.
 * `resolvedAt` is milliseconds since epoch, used to evaluate `ttl`.
 */
export const StoredStatusListSchema = z.object({
  payload: StatusListPayloadSchema,
  meta: z.object({
    resolvedAt: z.number().int().positive()
  })
});

export type StatusListPayload = z.infer<typeof StatusListPayloadSchema>;
export type StoredStatusList = z.infer<typeof StoredStatusListSchema>;

/**
 * Validates that a fetched payload's `sub` matches the expected URI.
 * Prevents storing a token under the wrong cache identity.
 */
export const validatePayloadSub = (
  payload: StatusListPayload,
  expectedUri: string
): boolean => payload.sub === expectedUri;
