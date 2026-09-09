/**
 * Bridge between `zod` schemas and `neverthrow`, so that parsing failures travel through the
 * same `Result` type used by the rest of the IT-Wallet feature instead of a schema-specific
 * success flag.
 */

import { err, ok, Result } from "neverthrow";
import { z } from "zod";

/**
 * Parses `value` against `schema` and lifts the outcome into a `Result`.
 *
 * @param schema - The schema describing the expected shape.
 * @param value - The value to validate.
 * @returns Ok with the parsed value, Err with the validation issues.
 */
export const parseWithSchema = <S extends z.ZodType>(
  schema: S,
  value: unknown
): Result<z.output<S>, z.ZodError> => {
  const result = schema.safeParse(value);
  return result.success ? ok(result.data) : err(result.error);
};
