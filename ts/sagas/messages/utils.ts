import { IResponseType } from "@pagopa/ts-commons/lib/requests";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { ValidationError } from "io-ts";
import {
  refreshSessionToken,
  sessionExpired
} from "../../store/actions/authentication";
import { Action } from "../../store/actions/types";
import { readablePrivacyReport } from "../../utils/reporters";

export type ResponseType<T> =
  | IResponseType<200, T>
  | IResponseType<
      400 | 401 | 403 | 404 | 429 | 500,
      { title?: string } | undefined
    >;

const checkIsError = (e: Error | Array<ValidationError>): e is Error =>
  e instanceof Error;
/**
 * Discern between Either.Right/Left, and status codes.
 * Will call onSuccess if and only if response is _Right with status 200_.
 * Takes care of managing status 401 via sessionExpired action.
 *
 * @param response
 * @param onSuccess
 * @param onFailure
 */
export function handleResponse<T>(
  response: E.Either<Array<ValidationError>, ResponseType<T>>,
  onSuccess: (payload: T) => Action,
  onFailure: (e: Error) => Action
): Action {
  return pipe(
    response,
    E.fromNullable(new Error("Response is undefined")),
    E.flattenW,
    E.fold(
      error =>
        onFailure(
          checkIsError(error) ? error : new Error(readablePrivacyReport(error))
        ),
      data => {
        if (data.status === 200) {
          return onSuccess(data.value);
        }

        if (data.status === 401) {
          return sessionExpired();
        }

        // FIXME: remove on behalf of 401
        if (data.status === 400) {
          return refreshSessionToken.request();
        }

        if (data.status === 500) {
          // TODO: provide status code along with message in error
          //  see https://www.pivotaltracker.com/story/show/170819193
          return onFailure(new Error(data.value?.title ?? "UNKNOWN"));
        }
        return onFailure(new Error("UNKNOWN"));
      }
    )
  );
}
