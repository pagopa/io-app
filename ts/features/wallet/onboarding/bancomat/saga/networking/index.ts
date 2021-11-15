import { fromNullable } from "fp-ts/lib/Option";
import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { ContentClient } from "../../../../../../api/content";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  isRawBancomat,
  PaymentManagerToken
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getGenericError } from "../../../../../../utils/errors";
import { getPaymentMethodHash } from "../../../../../../utils/paymentMethod";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { convertWalletV2toWalletV1 } from "../../../../../../utils/walletv2";
import {
  addBancomatToWallet,
  loadAbi,
  searchUserPans
} from "../../store/actions";

// load all bancomat abi
export function* handleLoadAbi(
  getAbi: ReturnType<typeof ContentClient>["getAbiList"]
) {
  try {
    const getAbiWithRefreshResult: SagaCallReturnType<typeof getAbi> =
      yield call(getAbi);
    if (getAbiWithRefreshResult.isRight()) {
      if (getAbiWithRefreshResult.value.status === 200) {
        yield put(loadAbi.success(getAbiWithRefreshResult.value.value));
      } else {
        throw new Error(
          `response status ${getAbiWithRefreshResult.value.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getAbiWithRefreshResult.value));
    }
  } catch (e) {
    yield put(loadAbi.failure(e));
  }
}

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

    const getPansWithRefreshResult: SagaCallReturnType<
      typeof getPansWithRefresh
    > = yield call(getPansWithRefresh);
    if (getPansWithRefreshResult.isRight()) {
      if (getPansWithRefreshResult.value.status === 200) {
        const response = getPansWithRefreshResult.value.value.data;
        return yield put(
          searchUserPans.success(
            fromNullable({
              cards: response?.data ?? [],
              messages: response?.messages ?? []
            }).getOrElse({ cards: [], messages: [] })
          )
        );
      } else {
        return yield put(
          searchUserPans.failure(
            getGenericError(
              new Error(
                `response status ${getPansWithRefreshResult.value.status}`
              )
            )
          )
        );
      }
    } else {
      return yield put(
        searchUserPans.failure(
          getGenericError(
            new Error(readablePrivacyReport(getPansWithRefreshResult.value))
          )
        )
      );
    }
  } catch (e) {
    if (e === "max-retries") {
      return yield put(searchUserPans.failure({ kind: "timeout" }));
    }
    if (typeof e === "string") {
      return yield put(searchUserPans.failure(getGenericError(new Error(e))));
    }
    return yield put(searchUserPans.failure(getGenericError(e)));
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
      addPans({ data: { data: [action.payload] } })
    );
    const addPansWithRefreshResult: SagaCallReturnType<
      typeof addPansWithRefresh
    > = yield call(addPansWithRefresh);
    if (addPansWithRefreshResult.isRight()) {
      if (addPansWithRefreshResult.value.status === 200) {
        const wallets = (addPansWithRefreshResult.value.value.data ?? []).map(
          convertWalletV2toWalletV1
        );
        // search for the added bancomat.
        const maybeWallet = fromNullable(
          wallets.find(
            w =>
              w.paymentMethod &&
              getPaymentMethodHash(w.paymentMethod) === action.payload.hpan
          )
        );
        if (
          maybeWallet.isSome() &&
          isRawBancomat(maybeWallet.value.paymentMethod)
        ) {
          yield put(
            // success
            addBancomatToWallet.success(maybeWallet.value.paymentMethod)
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
      throw new Error(readablePrivacyReport(addPansWithRefreshResult.value));
    }
  } catch (e) {
    yield put(addBancomatToWallet.failure(e));
  }
}
