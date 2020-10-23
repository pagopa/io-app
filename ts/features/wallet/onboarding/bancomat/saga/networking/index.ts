import { call, put } from "redux-saga/effects";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { ActionType } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import {
  addBancomatToWallet,
  loadAbi,
  searchUserPans
} from "../../store/actions";

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

export type LoadPansError = TimeoutError | GenericError;

type TimeoutError = { readonly kind: "timeout" };

type GenericError = { kind: "generic"; value: Error };

// get user's pans
export function* handleLoadPans(
  getPans: ReturnType<typeof PaymentManagerClient>["getPans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof searchUserPans.request>
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
          searchUserPans.success(
            fromNullable(getPansWithRefreshResult.value.value.data).getOrElse(
              []
            )
          )
        );
      } else {
        return yield put(
          searchUserPans.failure({
            kind: "generic",
            value: new Error(
              `response status ${getPansWithRefreshResult.value.status}`
            )
          })
        );
      }
    } else {
      return yield put(
        searchUserPans.failure({
          kind: "generic",
          value: new Error(readableReport(getPansWithRefreshResult.value))
        })
      );
    }
  } catch (e) {
    if (e === "max-retries") {
      return yield put(searchUserPans.failure({ kind: "timeout" }));
    }
    if (typeof e === "string") {
      return yield put(
        searchUserPans.failure({ kind: "generic", value: new Error(e) })
      );
    }
    return yield put(searchUserPans.failure({ kind: "generic", value: e }));
  }
}

// add pan to wallet
export function* handleAddPan(
  addPans: ReturnType<typeof PaymentManagerClient>["addPans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addBancomatToWallet.request>
) {
  try {
    const addPansWithRefresh = sessionManager.withRefresh(
      // add a card as an array of one element
      addPans({ data: [action.payload] })
    );
    const addPansWithRefreshResult: SagaCallReturnType<typeof addPansWithRefresh> = yield call(
      addPansWithRefresh
    );
    if (addPansWithRefreshResult.isRight()) {
      if (addPansWithRefreshResult.value.status === 200) {
        const wallets = addPansWithRefreshResult.value.value.data ?? [];
        // search for the added bancomat.
        const maybeWallet = fromNullable(
          wallets.find(w => w.info.hashPan === action.payload.hpan)
        );
        if (maybeWallet.isSome()) {
          yield put(
            // success
            addBancomatToWallet.success(maybeWallet.value)
          );
        } else {
          throw new Error(
            `cannot find added bancomat in wallets list response`
          );
        }
      } else {
        throw new Error(
          `response status ${addPansWithRefreshResult.value.status}`
        );
      }
    } else {
      throw new Error(readableReport(addPansWithRefreshResult.value));
    }
  } catch (e) {
    yield put(addBancomatToWallet.failure(e));
  }
}
