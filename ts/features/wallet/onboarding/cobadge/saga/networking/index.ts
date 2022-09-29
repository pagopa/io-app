import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ContentClient } from "../../../../../../api/content";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import {
  isRawCreditCard,
  PaymentManagerToken,
  RawCreditCardPaymentMethod,
  RawPaymentMethod
} from "../../../../../../types/pagopa";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters";
import { SessionManager } from "../../../../../../utils/SessionManager";
import {
  addCoBadgeToWallet,
  loadCoBadgeAbiConfiguration,
  searchUserCoBadge
} from "../../store/actions";
import { onboardingCoBadgeSearchRequestId } from "../../store/reducers/searchCoBadgeRequestId";
import { addCobadgeToWallet } from "./addCobadgeToWallet";
import { searchUserCobadge } from "./searchUserCobadge";

/**
 * Load the user's cobadge cards. if a previous stored SearchRequestId is found then it will be used
 * within the search searchCobadgePans API, otherwise getCobadgePans will be used
 */
export function* handleSearchUserCoBadge(
  getCobadgePans: ReturnType<typeof PaymentManagerClient>["getCobadgePans"],
  searchCobadgePans: ReturnType<
    typeof PaymentManagerClient
  >["searchCobadgePans"],
  sessionManager: SessionManager<PaymentManagerToken>,
  searchAction: ActionType<typeof searchUserCoBadge.request>
) {
  // try to retrieve the searchRequestId for co-badge search
  const onboardingCoBadgeSearchRequest = yield* select(
    onboardingCoBadgeSearchRequestId
  );

  // get the results
  const result = yield* call(
    searchUserCobadge,
    { abiCode: searchAction.payload },
    getCobadgePans,
    searchCobadgePans,
    sessionManager,
    onboardingCoBadgeSearchRequest
  );

  // dispatch the related action
  if (E.isRight(result)) {
    yield* put(searchUserCoBadge.success(result.right));
  } else {
    yield* put(searchUserCoBadge.failure(result.left));
  }
}

const toRawCreditCardPaymentMethod = (
  rpm: RawPaymentMethod
): E.Either<NetworkError, RawCreditCardPaymentMethod> =>
  isRawCreditCard(rpm)
    ? E.right(rpm)
    : E.left(
        getGenericError(
          new Error("Cannot decode the payload as RawCreditCardPaymentMethod")
        )
      );

/**
 * Add Cobadge to wallet
 */
export function* handleAddCoBadgeToWallet(
  addCobadgeToWalletClient: ReturnType<
    typeof PaymentManagerClient
  >["addCobadgeToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  action: ActionType<typeof addCoBadgeToWallet.request>
) {
  // get the results
  const result: SagaCallReturnType<typeof addCobadgeToWallet> = yield* call(
    addCobadgeToWallet,
    addCobadgeToWalletClient,
    sessionManager,
    action.payload
  );

  const eitherRawCreditCard = pipe(
    result,
    E.chain(toRawCreditCardPaymentMethod)
  );

  // dispatch the related action
  if (E.isRight(eitherRawCreditCard)) {
    yield* put(addCoBadgeToWallet.success(eitherRawCreditCard.right));
  } else {
    yield* put(addCoBadgeToWallet.failure(eitherRawCreditCard.left));
  }
}

/**
 * Load CoBadge configuration
 */
export function* handleLoadCoBadgeConfiguration(
  getCobadgeServices: ReturnType<typeof ContentClient>["getCobadgeServices"],
  _: ActionType<typeof loadCoBadgeAbiConfiguration.request>
) {
  try {
    const getCobadgeServicesResult: SagaCallReturnType<
      typeof getCobadgeServices
    > = yield* call(getCobadgeServices);
    if (E.isRight(getCobadgeServicesResult)) {
      if (getCobadgeServicesResult.right.status === 200) {
        yield* put(
          loadCoBadgeAbiConfiguration.success(
            getCobadgeServicesResult.right.value
          )
        );
      } else {
        throw new Error(
          `response status ${getCobadgeServicesResult.right.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getCobadgeServicesResult.left));
    }
  } catch (e) {
    yield* put(loadCoBadgeAbiConfiguration.failure(getNetworkError(e)));
  }
}
