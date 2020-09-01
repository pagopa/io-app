import * as pot from "italia-ts-commons/lib/pot";
import { ITuple2, Tuple2 } from "italia-ts-commons/lib/tuples";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { PaginatedServiceTupleCollection } from "../../../definitions/backend/PaginatedServiceTupleCollection";
import { removeServiceTuples } from "../../store/actions/services";
import { messagesIdsByServiceIdSelector } from "../../store/reducers/entities/messages/messagesIdsByServiceId";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";

type VisibleServiceVersionById = {
  [index: string]: number | undefined;
};

export function* removeUnusedStoredServices(
  visibleServices: PaginatedServiceTupleCollection["items"]
): SagaIterator {
  const visibleServiceVersionById = visibleServices.reduce<
    VisibleServiceVersionById
  >(
    (accumulator, currentValue) => ({
      ...accumulator,
      [currentValue.service_id]: currentValue.version
    }),
    {}
  );

  const storedServicesById: ReturnType<typeof servicesByIdSelector> = yield select(
    servicesByIdSelector
  );

  const messagesIdsByServiceId: ReturnType<typeof messagesIdsByServiceIdSelector> = yield select(
    messagesIdsByServiceIdSelector
  );

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
