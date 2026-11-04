import { z } from "zod";

/**
 * Schema for parsing a nativeStackAndroid object of a rejected promise error in
 * an Android native module.
 */
const StackTraceElementSchema = z.object({
  lineNumber: z.number(),
  file: z.string(),
  methodName: z.string(),
  class: z.string()
});

/**
 * Schema for parsing specific parameters of a rejected promise error in an
 * Android native module. It's defined as partial to allow merging with the
 * common schema and it must be checked at runtime.
 */
const ModuleErrorAndroidSchema = z
  .object({
    nativeStackAndroid: z.array(StackTraceElementSchema)
  })
  .partial();

/**
 * Schema for parsing specific parameters of a rejected promise error in an iOS
 * native module. It's defined as partial to allow merging with the common
 * schema and it must be checked at runtime.
 */
const ModuleErrorIosSchema = z
  .object({
    domain: z.string(),
    nativeStackIOS: z.array(z.string())
  })
  .partial();

/** Error codes which the module uses to reject a promise. */
const ModuleErrorCodesSchema = z.enum([
  "PIN_REGEX_NOT_VALID",
  "INVALID_AUTH_URL",
  "THREADING_ERROR", // iOS only
  "UNSUPPORTED",
  "UNKNOWN_EXCEPTION"
]);

export type CieErrorCodes = z.infer<typeof ModuleErrorCodesSchema>;

/**
 * Schema which can be used to parse a rejected promise error the module. This
 * schema contains the common parameters that are shared across both Android and
 * iOS native modules. Parameters which are platform specific are defined as
 * optional and must be checked at runtime. It accepts a generic code schema to
 * allow for different error codes which can be defined in each module.
 *
 * @returns A schema for the common parameters of a rejected promise error in a
 *   native module.
 */

export const CieErrorSchema = z
  .object({
    code: ModuleErrorCodesSchema,
    message: z.string(),
    name: z.string(),
    userInfo: z.record(z.string(), z.any()).optional().or(z.null())
  })
  .and(ModuleErrorAndroidSchema)
  .and(ModuleErrorIosSchema);

export type CieError = z.infer<typeof CieErrorSchema>;
