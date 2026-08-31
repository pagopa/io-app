import { z } from "zod";

import { unknownToString } from "../../../../utils/errors";
import { FetchResponse, isFailureResponse } from "./fetch";

export type AsyncResult<T> =
  | { data: T; ok: true }
  | { error: string; ok: false };

export const jsonFetchToSchema = async <TSchema extends z.ZodType>(
  requestPromise: Promise<FetchResponse>,
  schema: TSchema
): Promise<AsyncResult<z.infer<TSchema>>> => {
  const responseResult = await requestPromise;
  if (isFailureResponse(responseResult)) {
    return { ok: false, error: responseResult.message };
  }
  if (!responseResult.response.ok) {
    return {
      ok: false,
      error: `Unexpected HTTP status ${responseResult.response.status}`
    };
  }

  try {
    const json = await responseResult.response.json();
    const parsingResult = schema.safeParse(json);

    if (!parsingResult.success) {
      return { ok: false, error: z.prettifyError(parsingResult.error) };
    }

    return { ok: true, data: parsingResult.data };
  } catch (error) {
    return { ok: false, error: unknownToString(error) };
  }
};
