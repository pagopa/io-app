import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { UserDataProcessingChoiceEnum } from "../../../../../definitions/backend/UserDataProcessingChoice";
import { BackendClient } from "../../../../api/backend";
import {
  deleteUserDataProcessing,
  loadUserDataProcessing,
  upsertUserDataProcessing
} from "../store/actions/userDataProcessing";
import { SagaCallReturnType } from "../../../../types/utils";
import { convertUnknownToError, getError } from "../../../../utils/errors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";

/**
 * The following logic:
 * - checks if there are updates on the processing of a previous request
 * - sumbits a new request if the state is ClOSED or if this is the first request
 */
export function* loadUserDataProcessingSaga(
  getUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["getUserDataProcessingRequest"],
  action: ActionType<(typeof loadUserDataProcessing)["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response = (yield* call(
      withRefreshApiCall,
      getUserDataProcessingRequest({
        choice
      }),
      action
    )) as unknown as SagaCallReturnType<typeof getUserDataProcessingRequest>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }
      if (response.right.status === 404 || response.right.status === 200) {
        yield* put(
          loadUserDataProcessing.success({
            choice,
            value:
              response.right.status === 200 ? response.right.value : undefined
          })
        );
      } else {
        throw new Error(
          `loadUserDataProcessingSaga response status ${response.right.status}`
        );
      }
    } else {
      throw new Error(readableReport(response.left));
    }
  } catch (e) {
    yield* put(
      loadUserDataProcessing.failure({
        choice,
        error: convertUnknownToError(e)
      })
    );
  }
}

export function* upsertUserDataProcessingSaga(
  postUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["postUserDataProcessingRequest"],
  action: ActionType<(typeof upsertUserDataProcessing)["request"]>
): SagaIterator {
  const choice = action.payload;
  try {
    const response = (yield* call(
      withRefreshApiCall,
      postUserDataProcessingRequest({
        body: { choice }
      }),
      action
    )) as unknown as SagaCallReturnType<typeof postUserDataProcessingRequest>;

    if (E.isRight(response) && response.right.status === 401) {
      return;
    }
    if (E.isRight(response) && response.right.status === 200) {
      yield* put(upsertUserDataProcessing.success(response.right.value));
      return E.right(response.right.value);
    } else {
      throw new Error(
        `An error occurred while submitting a request to ${choice} the profile`
      );
    }
  } catch (e) {
    yield* put(
      upsertUserDataProcessing.failure({
        choice,
        error: convertUnknownToError(e)
      })
    );
    return E.left(e);
  }
}

export function* deleteUserDataProcessingSaga(
  deleteUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["deleteUserDataProcessingRequest"],
  action: ActionType<(typeof deleteUserDataProcessing)["request"]>
): SagaIterator {
  const choice = action.payload;

  try {
    const response = (yield* call(
      withRefreshApiCall,
      deleteUserDataProcessingRequest({
        choice
      }),
      action
    )) as unknown as SagaCallReturnType<typeof deleteUserDataProcessingRequest>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        return;
      }
      if (response.right.status === 202) {
        yield* put(
          deleteUserDataProcessing.success({
            choice
          })
        );
        // reload user data processing
        yield* put(
          loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE)
        );
      } else {
        throw new Error(
          `response status ${response.right.status} with choice ${choice}`
        );
      }
    } else {
      throw new Error(readableReport(response.left));
    }
  } catch (e) {
    yield* put(
      deleteUserDataProcessing.failure({
        choice,
        error: getError(e)
      })
    );
  }
}
/**
 * Listen for requests related to the user data processing (profile deletion or profile-related data downloading)
 */
export function* watchUserDataProcessingSaga(
  getUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["getUserDataProcessingRequest"],
  postUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["postUserDataProcessingRequest"],
  deleteUserDataProcessingRequest: ReturnType<
    typeof BackendClient
  >["deleteUserDataProcessingRequest"]
): SagaIterator {
  yield* takeEvery(
    loadUserDataProcessing.request,
    loadUserDataProcessingSaga,
    getUserDataProcessingRequest
  );

  yield* takeEvery(
    deleteUserDataProcessing.request,
    deleteUserDataProcessingSaga,
    deleteUserDataProcessingRequest
  );

  yield* takeEvery(
    upsertUserDataProcessing.request,
    upsertUserDataProcessingSaga,
    postUserDataProcessingRequest
  );
}
