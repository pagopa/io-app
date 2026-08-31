import { z } from "zod";

/** Schema of a single IDP returned by the OneIdentity IDPs list endpoint */
export const IdpSchema = z.object({
  entityID: z.string(),
  status: z.string(),
  friendlyName: z.string(),
  active: z.boolean()
});

export type Idp = z.infer<typeof IdpSchema>;

export const IdpsSchema = z.array(IdpSchema);

export type Idps = z.infer<typeof IdpsSchema>;
