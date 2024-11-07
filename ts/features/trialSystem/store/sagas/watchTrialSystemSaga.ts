import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { SessionToken } from "../../../../types/SessionToken";
import { TrialSystemClient, createTrialSystemClient } from "../../api/client";
import { apiUrlPrefix } from "../../../../config";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusUpsert
} from "../actions";
import { getError } from "../../../../utils/errors";
import { TrialSystemError } from "../../utils/error";

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
      return;
    }

    if (result.right.status === 200) {
      yield* put(trialSystemActivationStatus.success(result.right.value));
      return;
    }

    if (result.right.status === 404) {
      /**
       * 404 is returned when the user is not found in the trial system. However, the API also returns 404 when the trial id is not found.
       * We assume the trial id is correct so the only reason for the 404 is the user not being found.
       */
      yield* put(
        trialSystemActivationStatus.failure({
          trialId: action.payload,
          error: new TrialSystemError(
            "User not found",
            "TRIAL_SYSTEM_USER_NOT_FOUND"
          )
        })
      );
      return;
    } else {
      yield* put(
        trialSystemActivationStatus.failure({
          trialId: action.payload,
          error: new TrialSystemError(`response status ${result.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(
      trialSystemActivationStatus.failure({
        trialId: action.payload,
        error: new TrialSystemError(
          getError(e).message,
          "TRIAL_SYSTEM_NETWORK_ERROR"
        )
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
