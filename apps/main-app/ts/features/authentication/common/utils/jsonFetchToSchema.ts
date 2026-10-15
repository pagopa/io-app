import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { unknownToString } from "../../../../utils/errors";
import { FetchFailureReason, FetchResponse, isFailureResponse } from "./fetch";

/**
 * Why `jsonFetchToSchema` failed: either the transport-level reason from the
 * fetch, or a problem with the response itself.
 */
export type JsonFetchError = {
  /**
   * The HTTP status code, set when `type` is `"http-status"` or
   * `"retryable-status"`.
   */
  code?: number;
  message: string;
  type: "http-status" | "invalid-json" | "invalid-schema" | FetchFailureReason;
};

/**
 * Parses an unknown value against a Zod schema and lifts the outcome into a
 * `neverthrow` Result.
 *
 * @param schema - The Zod schema describing the expected shape of the data.
 * @param value - The unknown value to validate.
 * @returns An `Ok` containing the safely parsed data, or an `Err` containing
 *   the prettified validation error.
 */
const parseWithSchema = <S extends z.ZodType>(
  schema: S,
  value: unknown
): Result<z.output<S>, JsonFetchError> => {
  const result = schema.safeParse(value);
  return result.success
    ? ok(result.data)
    : err({ type: "invalid-schema", message: z.prettifyError(result.error) });
};

/**
 * Resolves a fetch request, extracts the JSON body, and validates it against a
 * Zod schema.
 *
 * This pipeline safely handles transport-level failures, non-2xx HTTP status
 * codes, JSON parsing exceptions, and schema validation errors, wrapping any
 * failure into a predictable `Result`.
 *
 * @param requestPromise - A promise resolving to a custom `FetchResponse`.
 * @param schema - The Zod schema used to validate the extracted JSON body.
 * @returns A Promise resolving to an `Ok` with the strictly typed data, or an
 *   `Err` with the failure type and a descriptive message.
 */
export const jsonFetchToSchema = async <TSchema extends z.ZodType>(
  requestPromise: Promise<FetchResponse>,
  schema: TSchema
): Promise<Result<z.infer<TSchema>, JsonFetchError>> => {
  const responseResult = await requestPromise;
  if (isFailureResponse(responseResult)) {
    const { reason, message, response } = responseResult;
    return err({
      type: reason,
      message,
      ...(response && { code: response.status })
    });
  }

  const { ok: isOk, status } = responseResult.response;
  if (!isOk) {
    return err({
      type: "http-status",
      code: status,
      message: `Unexpected HTTP status ${status}`
    });
  }

  try {
    const json = await responseResult.response.json();
    return parseWithSchema(schema, json);
  } catch (error) {
    return err({ type: "invalid-json", message: unknownToString(error) });
  }
};
