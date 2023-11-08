import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { BackendPnClient } from "../../api/backendPn";
import { pnActivationUpsert, startPaymentStatusTracking } from "../actions";
import {
  trackPNServiceStatusChangeError,
  trackPNServiceStatusChangeSuccess
} from "../../analytics";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { BackendClient } from "../../../../api/backend";
import { watchPaymentUpdateRequests } from "./watchPaymentUpdateRequests";
import { watchPaymentStatusForMixpanelTracking } from "./watchPaymentStatusSaga";

function* upsertPnActivation(
  client: ReturnType<typeof BackendPnClient>,
  action: ActionType<typeof pnActivationUpsert.request>
) {
  const activation_status = action.payload;
  try {
    const isTest: ReturnType<typeof isPnTestEnabledSelector> = yield* select(
      isPnTestEnabledSelector
    );

    const result = yield* call(client.upsertPnActivation, {
      body: {
        activation_status
      },
      isTest
    });

    if (E.isLeft(result)) {
      yield* put(
        pnActivationUpsert.failure(new Error(readableReport(result.left)))
      );
    } else if (result.right.status === 204) {
      trackPNServiceStatusChangeSuccess(activation_status);
      yield* put(pnActivationUpsert.success(activation_status));
    } else {
      yield* call(reportPNServiceStatusOnFailure, !activation_status);
      yield* put(
        pnActivationUpsert.failure(
          new Error(`response status ${result.right.status}`)
        )
      );
    }
  } catch (e) {
    yield* call(reportPNServiceStatusOnFailure, !activation_status);
    yield* put(pnActivationUpsert.failure(getError(e)));
  }
}

function* reportPNServiceStatusOnFailure(predictedValue: boolean) {
  const selectedServicePreferencePot = yield* select(servicePreferenceSelector);
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

export function* watchPnSaga(
  bearerToken: SessionToken,
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
): SagaIterator {
  const pnBackendClient = BackendPnClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    getType(pnActivationUpsert.request),
    upsertPnActivation,
    pnBackendClient
  );

  yield* fork(watchPaymentUpdateRequests, getVerificaRpt);

  yield* takeLatest(
    getType(startPaymentStatusTracking),
    watchPaymentStatusForMixpanelTracking
  );
}
