import * as pot from "italia-ts-commons/lib/pot";
import { all, put, select } from "redux-saga/effects";
import { PaginatedServiceTupleCollection } from "../../../definitions/backend/PaginatedServiceTupleCollection";
import { loadService } from "../../store/actions/services";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { SagaIterator } from 'redux-saga';

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
        (pot.isNone(storedService) && !pot.isLoading(storedService)) ||
        // - is in the redux store as PotSome, is not updating and is outdated
        (pot.isSome(storedService) &&
          !pot.isUpdating(storedService) &&
          storedService.value.version < service.version)
      );
    })
    .map(_ => _.service_id);

  // Parallel fetch of those services content that we haven't loaded yet or need to be updated
  yield all(serviceDetailIdsToLoad.map(id => put(loadService.request(id))));
}
