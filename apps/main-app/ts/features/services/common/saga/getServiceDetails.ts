import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { put, select, take } from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";

import { ReduxSagaEffect } from "../../../../types/utils";
import { loadServiceDetail } from "../../details/store/actions/details";
import { serviceDetailsByIdPotSelector } from "../../details/store/selectors";

export function* getServiceDetails(
  serviceId: ServiceId
): Generator<ReduxSagaEffect, ServiceDetails | undefined> {
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
