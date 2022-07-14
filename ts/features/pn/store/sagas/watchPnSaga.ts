import { SagaIterator } from "redux-saga";
import { ActionType, getType } from "typesafe-actions";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { pnActivationUpsert } from "../actions/service";
import { BackendPnClient } from "../../api/backendPn";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";

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
      pNActivation: {
        activation_status
      },
      isTest
    });

    if (result.isLeft()) {
      yield* put(
        pnActivationUpsert.failure(new Error(readableReport(result.value)))
      );
    } else if (result.isRight() && result.value.status === 204) {
      yield* put(pnActivationUpsert.success(activation_status));
    } else {
      yield* put(
        pnActivationUpsert.failure(
          new Error(`response status ${result.value.status}`)
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
