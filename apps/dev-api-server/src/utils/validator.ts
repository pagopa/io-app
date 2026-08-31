import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { failure, PathReporter } from "io-ts/lib/PathReporter";

import { IOResponse } from "../payloads/response";

/**
 * check if the given payload is a right representation of the static type T
 * if it is not, an exception will be raised, otherwise an object of type T
 * will be returned
 */
export const validatePayload = <T, O, I>(codec: t.Type<T, O, I>, payload: I) =>
  pipe(
    decodePayload(codec, payload),
    E.fold(validationErrorArray => {
      throw Error(validationErrorArray.toString());
    }, identity)
  );

export const decodePayload = <T, O, I>(codec: t.Type<T, O, I>, payload: I) =>
  pipe(codec.decode(payload), E.mapLeft(failure));

export const validateAndCreatePayload = <T, O, I>(
  codec: t.Type<T, O, I>,
  payload: I,
  statusCode = 200
): IOResponse<T> => {
  const maybeValidPayload = codec.decode(payload);
  if (E.isLeft(maybeValidPayload)) {
    throw Error(PathReporter.report(maybeValidPayload).toString());
  }
  return { payload: maybeValidPayload.right, isJson: true, status: statusCode };
};

export const toPayload = <T>(payload: T, statusCode = 200): IOResponse<T> => ({
  payload,
  isJson: true,
  status: statusCode
});
