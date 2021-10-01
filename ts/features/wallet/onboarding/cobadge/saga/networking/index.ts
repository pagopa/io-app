import { Either, left, right } from "fp-ts/lib/Either";
import { select } from "redux-saga-test-plan/matchers";
import { call, put } from "redux-saga/effects";
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
  const onboardingCoBadgeSearchRequest: ReturnType<
    typeof onboardingCoBadgeSearchRequestId
  > = yield select(onboardingCoBadgeSearchRequestId);

  // get the results
  const result = yield call(
    searchUserCobadge,
    { abiCode: searchAction.payload },
    getCobadgePans,
    searchCobadgePans,
    sessionManager,
    onboardingCoBadgeSearchRequest
  );

  // dispatch the related action
  if (result.isRight()) {
    yield put(searchUserCoBadge.success(result.value));
  } else {
    yield put(searchUserCoBadge.failure(result.value));
  }
}

const toRawCreditCardPaymentMethod = (
  rpm: RawPaymentMethod
): Either<NetworkError, RawCreditCardPaymentMethod> =>
  isRawCreditCard(rpm)
    ? right(rpm)
    : left(
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
  const result: SagaCallReturnType<typeof addCobadgeToWallet> = yield call(
    addCobadgeToWallet,
    addCobadgeToWalletClient,
    sessionManager,
    action.payload
  );

  const eitherRawCreditCard = result.chain(toRawCreditCardPaymentMethod);

  // dispatch the related action
  if (eitherRawCreditCard.isRight()) {
    yield put(addCoBadgeToWallet.success(eitherRawCreditCard.value));
  } else {
    yield put(addCoBadgeToWallet.failure(eitherRawCreditCard.value));
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
    > = yield call(getCobadgeServices);
    if (getCobadgeServicesResult.isRight()) {
      if (getCobadgeServicesResult.value.status === 200) {
        yield put(
          loadCoBadgeAbiConfiguration.success(
            getCobadgeServicesResult.value.value
          )
        );
      } else {
        throw new Error(
          `response status ${getCobadgeServicesResult.value.status}`
        );
      }
    } else {
      throw new Error(readablePrivacyReport(getCobadgeServicesResult.value));
    }
  } catch (e) {
    yield put(loadCoBadgeAbiConfiguration.failure(getNetworkError(e)));
  }
}
