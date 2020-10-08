import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { loadAbi, loadPans } from "../../store/actions";

// load all bancomat abi
export function* handleLoadAbi(
  getAbi: ReturnType<typeof PaymentManagerClient>["getAbi"],
  sessionManager: SessionManager<PaymentManagerToken>
) {
  try {
    const getAbiWithRefresh = sessionManager.withRefresh(getAbi);
    const getAbiWithRefreshResult: SagaCallReturnType<typeof getAbiWithRefresh> = yield call(
      getAbiWithRefresh
    );
    if (getAbiWithRefreshResult.isRight()) {
      if (getAbiWithRefreshResult.value.status === 200) {
        yield put(loadAbi.success(getAbiWithRefreshResult.value.value));
      } else {
        throw new Error(
          `response status ${getAbiWithRefreshResult.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(getAbiWithRefreshResult.value));
    }
  } catch (e) {
    yield put(loadAbi.failure(e));
  }
}

export type LoadPansError = NotFoundError | TimeoutError | GenericError;

type NotFoundError = { readonly kind: "notFound" };

type TimeoutError = { readonly kind: "timeout" };

type GenericError = { kind: "generic"; value: Error };

// get user's pans
export function* handleLoadPans(
  getPans: ReturnType<typeof PaymentManagerClient>["getPans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof loadPans.request>
) {
  try {
    const getPansWithRefresh = sessionManager.withRefresh(
      getPans(action.payload)
    );

    const getPansWithRefreshResult: SagaCallReturnType<typeof getPansWithRefresh> = yield call(
      getPansWithRefresh
    );
    if (getPansWithRefreshResult.isRight()) {
      if (getPansWithRefreshResult.value.status === 200) {
        return yield put(
          loadPans.success(
            fromNullable(getPansWithRefreshResult.value.value.data).getOrElse(
              []
            )
          )
        );
      } else if (getPansWithRefreshResult.value.status === 404) {
        return yield put(loadPans.failure({ kind: "notFound" }));
      } else {
        return yield put(
          loadPans.failure({
            kind: "generic",
            value: new Error(
              `response status ${getPansWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        loadPans.failure({
          kind: "generic",
          value: new Error(readableReport(getPansWithRefreshResult.value))
        })
      );
    }
  } catch (e) {
    if (e === "max-retries") {
      return yield put(loadPans.failure({ kind: "timeout" }));
    }
    if (typeof e === "string") {
      return yield put(
        loadPans.failure({ kind: "generic", value: new Error(e) })
      );
    }
    return yield put(loadPans.failure({ kind: "generic", value: e }));
  }
}
