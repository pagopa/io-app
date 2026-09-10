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

/** Schema of the OneIdentity IDP friendly names map, keyed by `entityID` */
export const IdpFriendlyNamesSchema = z.record(z.string(), z.string());

export type IdpFriendlyNames = z.infer<typeof IdpFriendlyNamesSchema>;
