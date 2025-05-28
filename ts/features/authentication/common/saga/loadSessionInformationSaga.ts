import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { call, put } from "typed-redux-saga/macro";
import { PublicSession } from "../../../../../definitions/session_manager/PublicSession";

import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../store/actions";

import { BackendClient } from "../../../../api/backend";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError } from "../../../../utils/errors";

/**
 * Load session info from the Backend
 *
 * FIXME: this logic is common to all sagas that make requests to the backend,
 *        we should create a high order function that converts an API call into
 *        a saga.
 */
export function* loadSessionInformationSaga(
  getSession: ReturnType<typeof BackendClient>["getSession"],
  fields?: string
): Generator<
  ReduxSagaEffect,
  O.Option<PublicSession>,
  SagaCallReturnType<typeof getSession>
> {
  try {
    // Call the Backend service
    const response = yield* call(getSession, { fields });
    // Ko we got an error
    if (E.isLeft(response)) {
      throw readableReport(response.left);
    }

    if (response.right.status === 200) {
      // Ok we got a valid response, send a SESSION_LOAD_SUCCESS action
      yield* put(sessionInformationLoadSuccess(response.right.value));
      return O.some(response.right.value);
    }

    // we got a valid response but its status code is describing an error
    const errorMsgDefault = "Invalid server response";

    throw response.right.status === 400
      ? response.right.value.title || errorMsgDefault
      : errorMsgDefault;
  } catch (e) {
    yield* put(sessionInformationLoadFailure(convertUnknownToError(e)));
    return O.none;
  }
}
