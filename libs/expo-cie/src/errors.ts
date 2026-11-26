import { z } from "zod";

/** Known error codes returned by the module or Expo. */
export type CieErrorCodes =
  | "ERR_UNEXPECTED"
  | "INVALID_AUTH_URL"
  | "PIN_REGEX_NOT_VALID"
  | "THREADING_ERROR"
  | "UNEXPECTED_ERROR"
  | "UNKNOWN_EXCEPTION"
  | "UNSUPPORTED";

/**
 * Schema for a rejected native module promise. Expo may also return codes other
 * than the known CIE codes.
 */
export const CieErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  name: z.string().optional()
});

export type CieError = z.infer<typeof CieErrorSchema>;
