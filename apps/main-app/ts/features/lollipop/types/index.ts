import { z } from "zod";

/**
 * Schema of the response returned by the reserve endpoint
 */
export const ReserveSchema = z.object({
  authorization_endpoint: z.string(),
  client_id: z.string(),
  nonce: z.string(),
  redirect_uri: z.string(),
  state: z.string()
});

export type Reserve = z.infer<typeof ReserveSchema>;
