import * as pot from "italia-ts-commons/lib/pot";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";
import { all, call, Effect, put, select } from "redux-saga/effects";

import { GetVisibleServicesT } from "../../../definitions/backend/requestTypes";
import { sessionExpired } from "../../store/actions/authentication";
import {
  loadService,
  loadVisibleServices,
  removeServiceTuples
} from "../../store/actions/services";
import {
  MessagesIdsByServiceId,
  messagesIdsByServiceIdSelector
} from "../../store/reducers/entities/messages/messagesIdsByServiceId";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import { SagaCallReturnType } from "../../types/utils";

type VisibleServiceVersionById = {
  [index: string]: number | undefined;
};

/**
 * A generator to load the service details from the Backend
 *
 * @param {function} getService - The function that makes the Backend request
 * @param {string} id - The id of the service to load
 * @returns {IterableIterator<Effect | Either<Error, ServicePublic>>}
 */
// tslint:disable-next-line: cognitive-complexity
export function* loadVisibleServicesRequestHandler(
  getVisibleServices: TypeofApiCall<GetVisibleServicesT>
): IterableIterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getVisibleServices> = yield call(
      getVisibleServices,
      {}
    );

    if (response !== undefined && response.status === 200) {
      const { items: visibleServices } = response.value;
      yield put(loadVisibleServices.success(visibleServices));

      const visibleServiceVersionById = visibleServices.reduce<
        VisibleServiceVersionById
      >(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue.service_id]: currentValue.version
        }),
        {}
      );

      const storedServicesById: ServicesByIdState = yield select(
        servicesByIdSelector
      );

      const messagesIdsByServiceId: MessagesIdsByServiceId = yield select(
        messagesIdsByServiceIdSelector
      );

      // Create an array of tuples containing:
      // - serviceId (to remove service from the servicesById section of the redux store)
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
          const organizationFiscalCode = pot.getOrElse(
            pot.map(storedPotService, _ => _.organization_fiscal_code),
            undefined
          );

          return accumulator.concat(Tuple2(serviceId, organizationFiscalCode));
        }

        return accumulator;
      }, []);
      // Dispatch action to remove the services from the redux store
      yield put(removeServiceTuples(serviceTuplesToRemove));

      // Load only services that are not already stored or are outdated (we have a new version).
      const serviceIdsToLoad = Object.keys(visibleServiceVersionById).filter(
        _ => {
          const visibleServiceVersion = visibleServiceVersionById[_];

          if (visibleServiceVersion === undefined) {
            return false;
          }

          const storedService = storedServicesById[_];
          return (
            storedService === undefined ||
            (pot.isNone(storedService) && !pot.isLoading(storedService)) ||
            (pot.isSome(storedService) &&
              !pot.isUpdating(storedService) &&
              storedService.value.version < visibleServiceVersion)
          );
        }
      );

      // Parallel fetch of those services that we haven't loaded yet or need to be updated
      yield all(serviceIdsToLoad.map(id => put(loadService.request(id))));
    } else if (response !== undefined && response.status === 401) {
      // on 401, expire the current session and restart the authentication flow
      yield put(sessionExpired());
      return;
    } else {
      throw Error();
    }
  } catch {
    yield put(loadVisibleServices.failure());
  }
}
