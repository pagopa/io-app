import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { PnClient, createPnClient } from "../../api/client";
import { pnActivationUpsert, startPNPaymentStatusTracking } from "../actions";
import {
  trackPNServiceStatusChangeError,
  trackPNServiceStatusChangeSuccess
} from "../../analytics";
import { servicePreferencePotSelector } from "../../../services/details/store/reducers";
import { isServicePreferenceResponseSuccess } from "../../../services/details/types/ServicePreferenceResponse";
import { watchPaymentStatusForMixpanelTracking } from "./watchPaymentStatusSaga";

function* handlePnActivation(
  upsertPnActivation: PnClient["upsertPNActivation"],
  action: ActionType<typeof pnActivationUpsert.request>
) {
  const activation_status = action.payload.value;
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
      yield* put(
        pnActivationUpsert.failure(new Error(readableReport(result.left)))
      );
      action.payload.onFailure?.();
    } else if (result.right.status === 204) {
      trackPNServiceStatusChangeSuccess(activation_status);
      yield* put(pnActivationUpsert.success(activation_status));
      action.payload.onSuccess?.();
    } else {
      yield* call(reportPNServiceStatusOnFailure, !activation_status);
      yield* put(
        pnActivationUpsert.failure(
          new Error(`response status ${result.right.status}`)
        )
      );
      action.payload.onFailure?.();
    }
  } catch (e) {
    yield* call(reportPNServiceStatusOnFailure, !activation_status);
    yield* put(pnActivationUpsert.failure(getError(e)));
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
