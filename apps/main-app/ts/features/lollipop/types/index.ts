import { z } from "zod";

/**
 * Schema of the response returned by the reserve endpoint
 */
export const ReserveSchema = z.object({
  client_id: z.string(),
  issuer: z.string(),
  nonce: z.string(),
  redirect_uri: z.string(),
  state: z.string()
});

export type Reserve = z.infer<typeof ReserveSchema>;
