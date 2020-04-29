import * as pot from "italia-ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { all, put, select } from "redux-saga/effects";
import { PaginatedServiceTupleCollection } from "../../../definitions/backend/PaginatedServiceTupleCollection";
import { loadServiceDetail } from "../../store/actions/services";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";

/**
 * Check which services detail must be loaded. If there are, loading action will be dispatched
 * A service detail has to be loaded if one of these conditions is true
 * - it is not into the store (servicesByIdSelector)
 * - the relative stored value is a pot none (but not loading)
 * - the relative stored value is some and its version is less than the visible one
 * @param visibleServices
 */
export function* refreshStoredServices(
  visibleServices: PaginatedServiceTupleCollection["items"]
): SagaIterator {
  const storedServicesById: ReturnType<
    typeof servicesByIdSelector
  > = yield select(servicesByIdSelector);

  const serviceDetailIdsToLoad = visibleServices
    .filter(service => {
      const serviceId = service.service_id;
      const storedService = storedServicesById[serviceId];
      return (
        // The service detail:
        // - is not in the redux store
        storedService === undefined ||
        // - is in the redux store as PotNone and not loading
        pot.isNone(storedService) ||
        // - is in the redux store as PotSome, is not updating and is outdated
        (pot.isSome(storedService) &&
          !pot.isUpdating(storedService) &&
          storedService.value.version < service.version)
      );
    })
    .map(_ => _.service_id);
  // Parallel fetch of those services content that we haven't loaded yet or need to be updated
  yield all(
    serviceDetailIdsToLoad.map(id => put(loadServiceDetail.request(id)))
  );
}
