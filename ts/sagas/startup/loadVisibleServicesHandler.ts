import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { BackendClient } from "../../api/backend";
import { sessionExpired } from "../../store/actions/authentication";
import { loadVisibleServices } from "../../store/actions/services";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { convertUnknownToError } from "../../utils/errors";
import { refreshStoredServices } from "../services/refreshStoredServices";
import { removeUnusedStoredServices } from "../services/removeUnusedStoredServices";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<ReduxSagaEffect | Either<Error, ServicePublic>>}
 */
export function* loadVisibleServicesRequestHandler(
  getVisibleServices: ReturnType<typeof BackendClient>["getVisibleServices"]
): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof getVisibleServices>
> {
  try {
    const response = yield* call(getVisibleServices, {});
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }
    if (response.right.status === 200) {
      const { items: visibleServices } = response.right.value;
      yield* put(loadVisibleServices.success(visibleServices));

      // Check if old version of services are stored and load new available versions of services
      yield* call(removeUnusedStoredServices, visibleServices);
      yield* call(refreshStoredServices, visibleServices);
    } else if (response.right.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield* put(sessionExpired());
      return;
    } else {
      throw Error("An error occurred loading visible services");
    }
  } catch (e) {
    yield* put(loadVisibleServices.failure(convertUnknownToError(e)));
  }
}
