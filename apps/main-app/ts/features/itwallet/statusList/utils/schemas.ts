import { z } from "zod";

const StatusListSigningKeysSchema = z.object({
  keys: z.array(z.looseObject({ kty: z.enum(["EC", "RSA"]) }))
});

/** Valid x5c header shape. Certificate encoding is validated natively. */
export const StatusListX5cSchema = z.array(z.string().min(1)).min(1);

/**
 * Validates Wallet Provider metadata needed to verify Status List Tokens.
 */
export const WalletProviderMetadataSchema = z.object({
  metadata: z.object({
    wallet_solution: z.object({
      jwks: StatusListSigningKeysSchema
    })
  })
});
