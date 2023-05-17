import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { BackendPnClient } from "../../api/backendPn";
import { pnActivationUpsert } from "../actions";

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
      yield* put(pnActivationUpsert.success(activation_status));
    } else {
      yield* put(
        pnActivationUpsert.failure(
          new Error(`response status ${result.right.status}`)
        )
      );
    }
  } catch (e) {
    yield* put(pnActivationUpsert.failure(getError(e)));
  }
}

export function* watchPnSaga(bearerToken: SessionToken): SagaIterator {
  const client = BackendPnClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    getType(pnActivationUpsert.request),
    upsertPnActivation,
    client
  );
}
