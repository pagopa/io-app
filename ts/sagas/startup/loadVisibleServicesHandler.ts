import * as pot from "italia-ts-commons/lib/pot";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { INonEmptyStringTag } from "italia-ts-commons/lib/strings";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";
import { all, call, Effect, put, select } from "redux-saga/effects";
import { BackendClient } from "../../api/backend";
import { sessionExpired } from "../../store/actions/authentication";
import {
  loadServiceContent,
  loadVisibleServices,
  removeServiceTuples
} from "../../store/actions/services";
import { messagesIdsByServiceIdSelector } from "../../store/reducers/entities/messages/messagesIdsByServiceId";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { SagaCallReturnType } from "../../types/utils";

type VisibleServiceVersionById = {
  [index: string]: number | undefined;
};

type ReturnedVisibleServicesType = ReadonlyArray<{
  service_id: string & INonEmptyStringTag;
  version: number;
}>;

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

      // Check if old version of services are stored and load new available versions of services
      yield call(removeOldStoredServices, visibleServices);
      yield call(refreshStoredServices, visibleServices);

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

function* removeOldStoredServices(
  visibleServices: ReturnedVisibleServicesType
) {
  const visibleServiceVersionById = visibleServices.reduce<
    VisibleServiceVersionById
  >(
    (accumulator, currentValue) => ({
      ...accumulator,
      [currentValue.service_id]: currentValue.version
    }),
    {}
  );

  const storedServicesById: ReturnType<
    typeof servicesByIdSelector
  > = yield select(servicesByIdSelector);

  const messagesIdsByServiceId: ReturnType<
    typeof messagesIdsByServiceIdSelector
  > = yield select(messagesIdsByServiceIdSelector);

  // Create an array of tuples containing:
  // - serviceId (to remove service from both the servicesById and the servicesMetadataById sections of the redux store)
  // - organizationFiscalCode (to remove service from serviceIdsByOrganizationFiscalCode
  //   section of the redux store)
  const serviceTuplesToRemove = Object.keys(storedServicesById).reduce<
    ReadonlyArray<ITuple2<string, string | undefined>>
  >((accumulator, serviceId) => {
    // Check if this service id must be removed
    // A service must be removed if is no more visible and not used by any loaded message.
    const mustRemoveServiceId =
      visibleServiceVersionById[serviceId] === undefined &&
      messagesIdsByServiceId[serviceId] === undefined;

    if (!mustRemoveServiceId) {
      return accumulator;
    }

    const storedPotService = storedServicesById[serviceId];

    if (storedPotService !== undefined) {
      // If the service detail is also loaded get the organization fiscal code
      const organizationFiscalCode = pot.toUndefined(
        pot.map(storedPotService, _ => _.organization_fiscal_code)
      );

      return [...accumulator, Tuple2(serviceId, organizationFiscalCode)];
    }

    return accumulator;
  }, []);

  // Dispatch action to remove the services from the redux store
  yield put(removeServiceTuples(serviceTuplesToRemove));
}

function* refreshStoredServices(visibleServices: ReturnedVisibleServicesType) {
  const storedServicesById: ReturnType<
    typeof servicesByIdSelector
  > = yield select(servicesByIdSelector);

  const serviceContentIdsToLoad = visibleServices
    .filter(service => {
      const serviceId = service.service_id;
      const storedService = storedServicesById[serviceId];
      return (
        // The service content:
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
  yield all(
    serviceContentIdsToLoad.map(id => put(loadServiceContent.request(id)))
  );
}
