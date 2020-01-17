/**
 * A saga to manage the load/refresh of visible services
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Effect, put, select, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { BackendClient } from "../../api/backend";
import { contentServicesByScopeLoad } from "../../store/actions/content";
import { updateOrganizations } from "../../store/actions/organizations";
import {
  FirstServiceLoadSuccess,
  loadService,
  loadVisibleServices,
  markServiceAsRead
} from "../../store/actions/services";
import { servicesByScopeSelector } from "../../store/reducers/content";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { visibleServicesDetailLoadStateSelector } from "../../store/reducers/entities/services";
import { isFirstVisibleServiceLoadCompletedSelector } from "../../store/reducers/entities/services/firstServicesLoading";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { isVisibleService } from "../../utils/services";
import { loadServiceDetailRequestHandler } from "../startup/loadServiceDetailRequestHandler";
import { loadVisibleServicesRequestHandler } from "../startup/loadVisibleServicesHandler";

/**
 * A saga to managing requests to load/refresh services data from backend
 * @param backendClient
 */
export function* watchLoadServicesSaga(
  backendClient: ReturnType<typeof BackendClient>
) {
  yield takeEvery(
    getType(loadService.request),
    loadServiceDetailRequestHandler,
    backendClient.getService
  );

  yield takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  yield takeEvery(
    [getType(loadService.success), getType(contentServicesByScopeLoad.success)],
    handleFirstVisibleServiceLoadSaga
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
  // Load/refresh refresh services scope list
  yield put(contentServicesByScopeLoad.request());
}

/**
 *  A function to check if all services detail and scopes are loaded with success.
 *  If it is true, by dispatching FirstServiceLoadSuccess the app stop considering loaded services as read
 */
export function* handleFirstVisibleServiceLoadSaga(): IterableIterator<Effect> {
  const isFirstVisibleServiceLoadCompleted: ReturnType<
    typeof isFirstVisibleServiceLoadCompletedSelector
  > = yield select(isFirstVisibleServiceLoadCompletedSelector);
  if (!isFirstVisibleServiceLoadCompleted) {
    const servicesByScope: ReturnType<
      typeof servicesByScopeSelector
    > = yield select(servicesByScopeSelector);
    const visibleServicesDetailsLoadState: ReturnType<
      typeof visibleServicesDetailLoadStateSelector
    > = yield select(visibleServicesDetailLoadStateSelector);
    if (
      servicesByScope &&
      visibleServicesDetailsLoadState &&
      pot.isSome(visibleServicesDetailsLoadState) &&
      pot.isSome(servicesByScope)
    ) {
      yield put(FirstServiceLoadSuccess());
    }
  }
}

/**
 * A function to check if a service is loaded for the first time (at first startup or when the cache
 * is cleaned). If true, the app shows the service list item without badge
 * @param serviceId
 */
export function* handleServiceReadabilitySaga(
  serviceId: string
): IterableIterator<Effect> {
  const isFirstVisibleServiceLoadCompleted: ReturnType<
    typeof isFirstVisibleServiceLoadCompletedSelector
  > = yield select(isFirstVisibleServiceLoadCompletedSelector);

  if (!isFirstVisibleServiceLoadCompleted) {
    yield put(markServiceAsRead(serviceId as ServiceId));
  }
}

/**
 * A function to check if the organization_name included in the service detail is different
 * from the stored organization name (for the same organization_fiscal_code).
 * If true, the incoming one is saved into the redux store.
 * @param service
 */
export function* handleOrganizationNameUpdateSaga(
  service: ServicePublic
): IterableIterator<Effect> {
  // If the organization fiscal code is associated to different organization names,
  // it is considered valid the one declared for a visible service
  const organizations: OrganizationNamesByFiscalCodeState = yield select(
    organizationNamesByFiscalCodeSelector
  );
  if (organizations) {
    const fc = service.organization_fiscal_code;
    const organization = organizations[fc];
    const visibleServices: VisibleServicesState = yield select(
      visibleServicesSelector
    );
    const isVisible =
      isVisibleService(visibleServices, pot.some(service)) || false;
    // If the organization has been previously saved in the organization entity,
    // the organization name is updated only if the related service is visible
    if (
      !organization ||
      (organization && isVisible && organization !== service.organization_name)
    ) {
      yield put(updateOrganizations(service));
    }
  }
}
