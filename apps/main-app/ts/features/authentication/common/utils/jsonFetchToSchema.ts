import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { unknownToString } from "../../../../utils/errors";
import { FetchResponse, isFailureResponse } from "./fetch";

/**
 * Parses an unknown value against a Zod schema and lifts the outcome into a `neverthrow` Result.
 *
 * @param schema - The Zod schema describing the expected shape of the data.
 * @param value - The unknown value to validate.
 * @returns An `Ok` containing the safely parsed data, or an `Err` containing a prettified validation error string.
 */
const parseWithSchema = <S extends z.ZodType>(
  schema: S,
  value: unknown
): Result<z.output<S>, string> => {
  const result = schema.safeParse(value);
  return result.success ? ok(result.data) : err(z.prettifyError(result.error));
};

/**
 * Resolves a fetch request, extracts the JSON body, and validates it against a Zod schema.
 *
 * This pipeline safely handles transport-level failures, non-2xx HTTP status codes,
 * JSON parsing exceptions, and schema validation errors, wrapping any failure into a predictable `Result`.
 *
 * @param requestPromise - A promise resolving to a custom `FetchResponse`.
 * @param schema - The Zod schema used to validate the extracted JSON body.
 * @returns A Promise resolving to an `Ok` with the strictly typed data, or an `Err` with a descriptive error message.
 */
export const jsonFetchToSchema = async <TSchema extends z.ZodType>(
  requestPromise: Promise<FetchResponse>,
  schema: TSchema
): Promise<Result<z.infer<TSchema>, string>> => {
  const responseResult = await requestPromise;
  if (isFailureResponse(responseResult)) {
    return err(responseResult.message);
  }

  if (!responseResult.response.ok) {
    return err(`Unexpected HTTP status ${responseResult.response.status}`);
  }

  try {
    const json = await responseResult.response.json();
    return parseWithSchema(schema, json);
  } catch (error) {
    return err(unknownToString(error));
  }
};
