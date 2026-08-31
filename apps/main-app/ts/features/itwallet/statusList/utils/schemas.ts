import { z } from "zod";

/** Validates Wallet Provider metadata needed to verify Status List Tokens. */
export const WalletProviderMetadataSchema = z.object({
  metadata: z.object({
    wallet_solution: z.object({
      jwks: z.object({
        keys: z.array(z.looseObject({ kty: z.enum(["EC", "RSA"]) }))
      })
    })
  })
});
