import * as pot from "@pagopa/ts-commons/lib/pot";
import { put, select, take } from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { loadServiceDetail } from "../../services/details/store/actions/details";
import { serviceDetailsByIdPotSelector } from "../../services/details/store/selectors";

export function* getServiceDetails(serviceId: ServiceId) {
  const initialServicePot = yield* select(
    serviceDetailsByIdPotSelector,
    serviceId
  );
  if (!pot.isSome(initialServicePot) || pot.isError(initialServicePot)) {
    yield* put(loadServiceDetail.request(serviceId));

    const outputAction = yield* take([
      loadServiceDetail.success,
      loadServiceDetail.failure
    ]);
    if (isActionOf(loadServiceDetail.failure, outputAction)) {
      return undefined;
    }

    const finalServicePot = yield* select(
      serviceDetailsByIdPotSelector,
      serviceId
    );
    return pot.toUndefined(finalServicePot);
  }

  return pot.toUndefined(initialServicePot);
}
