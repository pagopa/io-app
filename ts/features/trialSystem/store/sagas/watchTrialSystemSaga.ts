import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { IOToast } from "@pagopa/io-app-design-system";
import { SessionToken } from "../../../../types/SessionToken";
import { TrialSystemClient, createTrialSystemClient } from "../../api/client";
import { apiUrlPrefix } from "../../../../config";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusUpsert
} from "../actions";
import { getError } from "../../../../utils/errors";
import I18n from "../../../../i18n";

function* handleTrialSystemActivationStatusUpsert(
  upsertTrialSystemActivationStatus: TrialSystemClient["createSubscription"],
  action: ActionType<typeof trialSystemActivationStatusUpsert.request>
) {
  try {
    const result = yield* call(upsertTrialSystemActivationStatus, {
      trialId: action.payload
    });

    if (E.isLeft(result)) {
      yield* put(
        trialSystemActivationStatusUpsert.failure({
          trialId: action.payload,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 201) {
      yield* put(trialSystemActivationStatusUpsert.success(result.right.value));
      IOToast.success(I18n.t("features.trialSystem.toast.subscribed"));
    } else {
      yield* put(
        trialSystemActivationStatusUpsert.failure({
          trialId: action.payload,
          error: new Error(`response status ${result.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(
      trialSystemActivationStatusUpsert.failure({
        trialId: action.payload,
        error: getError(e)
      })
    );
  }
}

function* handleTrialSystemActivationStatus(
  trialSystemActivationStatusRequest: TrialSystemClient["getSubscription"],
  action: ActionType<typeof trialSystemActivationStatus.request>
) {
  try {
    const result = yield* call(trialSystemActivationStatusRequest, {
      trialId: action.payload
    });

    if (E.isLeft(result)) {
      yield* put(
        trialSystemActivationStatus.failure({
          trialId: action.payload,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 200) {
      yield* put(trialSystemActivationStatus.success(result.right.value));
    } else {
      yield* put(
        trialSystemActivationStatus.failure({
          trialId: action.payload,
          error: new Error(`response status ${result.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(
      trialSystemActivationStatus.failure({
        trialId: action.payload,
        error: getError(e)
      })
    );
  }
}

export function* watchTrialSystemSaga(bearerToken: SessionToken): SagaIterator {
  const trialSystemClient = createTrialSystemClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    trialSystemActivationStatusUpsert.request,
    handleTrialSystemActivationStatusUpsert,
    trialSystemClient.createSubscription
  );

  yield* takeLatest(
    trialSystemActivationStatus.request,
    handleTrialSystemActivationStatus,
    trialSystemClient.getSubscription
  );
}
