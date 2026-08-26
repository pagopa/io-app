import { z } from "zod";

const StatusListSigningKeysSchema = z.object({
  keys: z.array(z.looseObject({ kty: z.enum(["EC", "RSA"]) }))
});

/**
 * Validates Credential Issuer metadata needed to verify Status List Tokens.
 */
export const CredentialIssuerMetadataSchema = z.object({
  metadata: z.object({
    openid_credential_issuer: z.object({
      jwks: StatusListSigningKeysSchema
    })
  })
});

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
