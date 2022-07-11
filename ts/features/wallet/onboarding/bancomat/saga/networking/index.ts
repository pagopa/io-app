import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ContentClient } from "../../../../../../api/content";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  isRawBancomat,
  PaymentManagerToken
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  convertUnknownToError,
  getGenericError
} from "../../../../../../utils/errors";
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
      yield* call(getAbi);
    if (E.isRight(getAbiWithRefreshResult)) {
      if (getAbiWithRefreshResult.right.status === 200) {
        yield* put(loadAbi.success(getAbiWithRefreshResult.right.value));
      } else {
        throw new Error(
          `response status ${getAbiWithRefreshResult.right.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getAbiWithRefreshResult.left));
    }
  } catch (e) {
    yield* put(loadAbi.failure(convertUnknownToError(e)));
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
    > = yield* call(getPansWithRefresh);
    if (E.isRight(getPansWithRefreshResult)) {
      if (getPansWithRefreshResult.right.status === 200) {
        const response = getPansWithRefreshResult.right.value.data;
        return yield* put(
          searchUserPans.success(
            pipe(
              O.fromNullable({
                cards: response?.data ?? RA.empty,
                messages: response?.messages ?? RA.empty
              }),
              O.getOrElseW(() => ({ cards: [], messages: [] }))
            )
          )
        );
      } else {
        return yield* put(
          searchUserPans.failure(
            getGenericError(
              new Error(
                `response status ${getPansWithRefreshResult.right.status}`
              )
            )
          )
        );
      }
    } else {
      return yield* put(
        searchUserPans.failure(
          getGenericError(
            new Error(readablePrivacyReport(getPansWithRefreshResult.left))
          )
        )
      );
    }
  } catch (e) {
    if (e === "max-retries") {
      return yield* put(searchUserPans.failure({ kind: "timeout" }));
    }
    if (typeof e === "string") {
      return yield* put(searchUserPans.failure(getGenericError(new Error(e))));
    }
    return yield* put(
      searchUserPans.failure(getGenericError(convertUnknownToError(e)))
    );
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
    > = yield* call(addPansWithRefresh);
    if (E.isRight(addPansWithRefreshResult)) {
      if (addPansWithRefreshResult.right.status === 200) {
        const wallets = (addPansWithRefreshResult.right.value.data ?? []).map(
          convertWalletV2toWalletV1
        );
        // search for the added bancomat.
        const maybeWallet = pipe(
          O.fromNullable(
            wallets.find(
              w =>
                w.paymentMethod &&
                getPaymentMethodHash(w.paymentMethod) === action.payload.hpan
            )
          )
        );
        if (
          O.isSome(maybeWallet) &&
          isRawBancomat(maybeWallet.value.paymentMethod)
        ) {
          yield* put(
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
          `response status ${addPansWithRefreshResult.right.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(addPansWithRefreshResult.left));
    }
  } catch (e) {
    yield* put(addBancomatToWallet.failure(convertUnknownToError(e)));
  }
}
