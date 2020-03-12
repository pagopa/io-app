import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, select } from "redux-saga/effects";
import { PaginatedServiceTupleCollection } from "../../../definitions/backend/PaginatedServiceTupleCollection";
import { BackendClient } from "../../api/backend";
import { sessionExpired } from "../../store/actions/authentication";
import { refreshOrganizations } from "../../store/actions/organizations";
import { loadVisibleServices } from "../../store/actions/services";
import { servicesOrganizationsByFiscalCodeSelector } from "../../store/reducers/entities/services/servicesByOrganizationFiscalCode";
import { SagaCallReturnType } from "../../types/utils";
import { refreshStoredServices } from "../services/refreshStoredServices";
import { removeUnusedStoredServices } from "../services/removeUnusedStoredServices";

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
export function* loadVisibleServicesRequestHandler(
  getVisibleServices: ReturnType<typeof BackendClient>["getVisibleServices"]
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getVisibleServices> = yield call(
      getVisibleServices,
      {}
    );
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status === 200) {
      const { items: visibleServices } = response.value.value;
      yield put(loadVisibleServices.success(visibleServices));

      // Remove references to services no more visible nor related to messages received by the user
      yield call(refreshServicesStore, visibleServices);
    } else if (response.value.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired());
      return;
    } else {
      throw Error("An error occurred loading visible services");
    }
  } catch (error) {
    yield put(loadVisibleServices.failure(error));
  }
}

// This function clean the stored organizations: they are persisted only those providing at least one visible service.
function* refreshServicesStore(
  visibleServices: PaginatedServiceTupleCollection["items"]
) {
  // Remove old version of services or services no more visible
  yield call(removeUnusedStoredServices, visibleServices);

  // Load new available versions of services
  yield call(refreshStoredServices, visibleServices);

  // Remove references to organizations no more providing visible
  // services nor related to messages received by the user
  const organizationFiscalCodes: ReturnType<
    typeof servicesOrganizationsByFiscalCodeSelector
  > = yield select(servicesOrganizationsByFiscalCodeSelector);
  yield put(refreshOrganizations(Object.keys(organizationFiscalCodes)));
}
