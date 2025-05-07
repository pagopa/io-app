import * as pot from "@pagopa/ts-commons/lib/pot";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SagaIterator } from "redux-saga";
import { all, call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { apiUrlPrefix } from "../../../../config";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferencePotSelector } from "../../../services/details/store/reducers";
import { isServicePreferenceResponseSuccess } from "../../../services/details/types/ServicePreferenceResponse";
import {
  trackPNServiceStatusChangeError,
  trackPNServiceStatusChangeSuccess
} from "../../analytics";
import { PnClient, createPnClient } from "../../api/client";
import { pnActivationUpsert, startPNPaymentStatusTracking } from "../actions";
import { watchPaymentStatusForMixpanelTracking } from "./watchPaymentStatusSaga";

function* loadPreferenceIfValidId(serviceId: ServiceId | undefined) {
  if (serviceId !== undefined) {
    yield* put(loadServicePreference.request(serviceId));
  }
}
function* handlePnActivation(
  upsertPnActivation: PnClient["upsertPNActivation"],
  action: ActionType<typeof pnActivationUpsert.request>
) {
  const activation_status = action.payload.value;
  const pnServiceId = yield* select(pnMessagingServiceIdSelector);

  try {
    const isTest: ReturnType<typeof isPnTestEnabledSelector> = yield* select(
      isPnTestEnabledSelector
    );

    const result = yield* call(upsertPnActivation, {
      body: {
        activation_status
      },
      isTest
    });

    if (E.isLeft(result)) {
      yield* all([
        put(pnActivationUpsert.failure(new Error(readableReport(result.left)))),
        call(loadPreferenceIfValidId, pnServiceId)
      ]);
      action.payload.onFailure?.();
    } else if (result.right.status === 204) {
      trackPNServiceStatusChangeSuccess(activation_status);
      yield* all([
        put(pnActivationUpsert.success(activation_status)),
        call(loadPreferenceIfValidId, pnServiceId)
      ]);
      action.payload.onSuccess?.();
    } else {
      yield* all([
        call(reportPNServiceStatusOnFailure, !activation_status),
        put(
          pnActivationUpsert.failure(
            new Error(`response status ${result.right.status}`)
          )
        ),
        call(loadPreferenceIfValidId, pnServiceId)
      ]);

      action.payload.onFailure?.();
    }
  } catch (e) {
    yield* all([
      call(reportPNServiceStatusOnFailure, !activation_status),
      put(pnActivationUpsert.failure(getError(e))),
      call(loadPreferenceIfValidId, pnServiceId)
    ]);
    action.payload.onFailure?.();
  }
}

function* reportPNServiceStatusOnFailure(predictedValue: boolean) {
  const selectedServicePreferencePot = yield* select(
    servicePreferencePotSelector
  );
  const isServiceActive = pipe(
    selectedServicePreferencePot,
    pot.toOption,
    O.map(
      servicePreferenceResponse =>
        isServicePreferenceResponseSuccess(servicePreferenceResponse) &&
        servicePreferenceResponse.value.inbox
    ),
    O.getOrElse(() => predictedValue)
  );
  trackPNServiceStatusChangeError(isServiceActive);
}

export function* watchPnSaga(bearerToken: SessionToken): SagaIterator {
  const pnClient = createPnClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    pnActivationUpsert.request,
    handlePnActivation,
    pnClient.upsertPNActivation
  );

  yield* takeLatest(
    startPNPaymentStatusTracking,
    watchPaymentStatusForMixpanelTracking
  );
}
