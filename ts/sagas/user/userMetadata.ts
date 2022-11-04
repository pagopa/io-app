import * as pot from "@pagopa/ts-commons/lib/pot";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { call, fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { UserMetadata as BackendUserMetadata } from "../../../definitions/backend/UserMetadata";
import { BackendClient } from "../../api/backend";
import TypedI18n from "../../i18n";
import {
  userMetadataLoad,
  userMetadataUpsert
} from "../../store/actions/userMetadata";
import {
  backendUserMetadataToUserMetadata,
  emptyUserMetadata,
  UserMetadata,
  userMetadataSelector,
  userMetadataToBackendUserMetadata
} from "../../store/reducers/userMetadata";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { convertUnknownToError } from "../../utils/errors";

/**
 * A saga to fetch user metadata from the Backend
 */
export function* fetchUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"]
): Generator<
  ReduxSagaEffect,
  E.Either<Error, BackendUserMetadata>,
  SagaCallReturnType<typeof getUserMetadata>
> {
  try {
    const response = yield* call(getUserMetadata, {});

    // Can't decode response
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }

    if (response.right.status !== 200) {
      if (response.right.status === 204) {
        // Return an empty object cause profile has no metadata yet (204 === No Content)
        return E.right<Error, BackendUserMetadata>(emptyUserMetadata);
      }

      const error =
        response.right.status === 500 ? response.right.value.title : undefined;
      // Return the error
      return E.left<Error, BackendUserMetadata>(Error(error));
    }

    return E.right<Error, BackendUserMetadata>(response.right.value);
  } catch (error) {
    return E.left<Error, BackendUserMetadata>(convertUnknownToError(error));
  }
}

/**
 * Call this saga to load userMetadata and to store the
 * result in the redux store.
 */
export function* loadUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"],
  setLoading: boolean = false
): Generator<
  ReduxSagaEffect,
  O.Option<UserMetadata>,
  SagaCallReturnType<typeof fetchUserMetadata>
> {
  if (setLoading) {
    yield* put(userMetadataLoad.request());
  }

  const backendUserMetadataOrError = yield* call(
    fetchUserMetadata,
    getUserMetadata
  );

  if (E.isLeft(backendUserMetadataOrError)) {
    yield* put(userMetadataLoad.failure(backendUserMetadataOrError.left));
    return O.none;
  }

  const backendUserMetadata = backendUserMetadataOrError.right;

  const userMetadataOrError =
    backendUserMetadataToUserMetadata(backendUserMetadata);

  if (E.isLeft(userMetadataOrError)) {
    yield* put(userMetadataLoad.failure(userMetadataOrError.left));
    return O.none;
  }

  yield* put(userMetadataLoad.success(userMetadataOrError.right));

  return O.some(userMetadataOrError.right);
}

/**
 * Listen for userMetadataLoad.request and calls loadUserMetadata saga.
 */
export function* watchLoadUserMetadata(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"]
) {
  yield* takeLatest(
    getType(userMetadataLoad.request),
    loadUserMetadataManager,
    getUserMetadata
  );
}

/**
 * Call loadUserMetadata saga.
 */
function* loadUserMetadataManager(
  getUserMetadata: ReturnType<typeof BackendClient>["getUserMetadata"]
) {
  yield* fork(loadUserMetadata, getUserMetadata);
}

/**
 * Used to post new userMetadata to the Backend
 */
export function* postUserMetadata(
  createOrUpdateUserMetadata: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserMetadata"],
  backendUserMetadata: BackendUserMetadata
): Generator<
  ReduxSagaEffect,
  E.Either<Error, BackendUserMetadata>,
  SagaCallReturnType<typeof createOrUpdateUserMetadata>
> {
  try {
    const response = yield* call(createOrUpdateUserMetadata, {
      body: backendUserMetadata
    });

    // Can't decode response
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }

    if (response.right.status !== 200) {
      const error =
        response.right.status === 500 ? response.right.value.title : undefined;
      // Return the error
      return E.left<Error, BackendUserMetadata>(Error(error));
    }

    return E.right<Error, BackendUserMetadata>(response.right.value);
  } catch (error) {
    return E.left<Error, BackendUserMetadata>(convertUnknownToError(error));
  }
}

/**
 * Post new userMetadata to the Backend and store
 * the result in the redux store.
 */
export function* upsertUserMetadata(
  createOrUpdateUserMetadata: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserMetadata"],
  userMetadata: UserMetadata,
  setLoading: boolean = false
): Generator<ReduxSagaEffect, O.Option<UserMetadata>, any> {
  if (setLoading) {
    yield* put(userMetadataUpsert.request(userMetadata));
  }

  const currentUserMetadata: ReturnType<typeof userMetadataSelector> =
    yield* select(userMetadataSelector);

  // The version of the new userMetadata must be one more
  // the old one.
  const currentVersion: number = pot.getOrElse(
    pot.map(currentUserMetadata, _ => _.version),
    0
  );

  if (userMetadata.version !== currentVersion + 1) {
    yield* put(
      userMetadataUpsert.failure(
        new Error(TypedI18n.t("userMetadata.errors.upsertVersion"))
      )
    );
    return O.none;
  }

  // Call the saga that perform the API request.
  const updatedBackendUserMetadataOrError: SagaCallReturnType<
    typeof postUserMetadata
  > = yield* call(
    postUserMetadata,
    createOrUpdateUserMetadata,
    // Backend stores the metadata as a plain string
    // so we do the conversion here.
    userMetadataToBackendUserMetadata(userMetadata)
  );

  if (E.isLeft(updatedBackendUserMetadataOrError)) {
    yield* put(
      userMetadataUpsert.failure(updatedBackendUserMetadataOrError.left)
    );
    return O.none;
  }

  const updatedBackendUserMetadata = updatedBackendUserMetadataOrError.right;

  // Trasform back the metadata from plain string to an object.
  const updatedUserMetadataOrError = backendUserMetadataToUserMetadata(
    updatedBackendUserMetadata
  );

  if (E.isLeft(updatedUserMetadataOrError)) {
    yield* put(userMetadataUpsert.failure(updatedUserMetadataOrError.left));
    return O.none;
  }

  yield* put(userMetadataUpsert.success(updatedUserMetadataOrError.right));
  return O.some(updatedUserMetadataOrError.right);
}

/**
 * Extract the action payload and call upsertUserMetadata saga.
 */
export function* upsertUserMetadataManager(
  createOrUpdateUserMetadata: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserMetadata"],
  action: ActionType<typeof userMetadataUpsert.request>
) {
  yield* fork(upsertUserMetadata, createOrUpdateUserMetadata, action.payload);
}

/**
 * Listen for userMetadataUpsert.request and calls upsertUserMetadata saga.
 */
export function* watchUpserUserMetadata(
  createOrUpdateUserMetadata: ReturnType<
    typeof BackendClient
  >["createOrUpdateUserMetadata"]
) {
  yield* takeLatest(
    getType(userMetadataUpsert.request),
    upsertUserMetadataManager,
    createOrUpdateUserMetadata
  );
}
