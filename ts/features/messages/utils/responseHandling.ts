import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import { ValidationError } from "io-ts";
import { Action } from "../../../store/actions/types";
import { readablePrivacyReport } from "../../../utils/reporters";

export type ResponseType<T> =
  | IResponseType<200, T>
  | IResponseType<
      400 | 401 | 403 | 404 | 429 | 500,
      { title?: string } | undefined
    >;

/**
 * Discern between Either.Right/Left, and status codes.
 * Will call onSuccess if and only if response is _Right with status 200_.
 * Returns undefined for status 401 (session expired, handled upstream).
 *
 * @param response
 * @param onSuccess
 * @param onFailure
 */
export function handleResponse<T>(
  response: E.Either<Array<ValidationError>, ResponseType<T>>,
  onSuccess: (payload: T) => Action,
  onFailure: (e: Error) => Action
): Action | undefined {
  // This check has been kept for retro-compatibility,
  // even if typescript suggests that 'response' is always defined
  if (!response) {
    return onFailure(new Error("Response is undefined"));
  }

  if (E.isLeft(response)) {
    return onFailure(new Error(readablePrivacyReport(response.left)));
  }

  const data = response.right;

  if (data.status === 200) {
    return onSuccess(data.value);
  }

  if (data.status === 401) {
    return undefined;
  }

  return onFailure(
    new Error(`Response status code ${data.status} ${data.value?.title}`)
  );
}
