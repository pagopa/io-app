import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { IDPayClient } from "../../../common/api/client";
import {
  idPayBeneficiaryDetailsGet,
  idPayOnboardingStatusGet,
  idpayInitiativeGet,
  idpayTimelinePageGet
} from "../store/actions";
import { handleGetBeneficiaryDetails } from "./handleGetBeneficiaryDetails";
import { handleGetInitiativeDetails } from "./handleGetInitiativeDetails";
import { handleGetOnboardingStatus } from "./handleGetOnboardingStatus";
import { handleGetTimelinePage } from "./handleGetTimelinePage";

/**
 * Handle IDPAY initiative requests
 * @param idPayClient
 * @param bpdToken
 * @param preferredLanguage
 */
export function* watchIDPayInitiativeDetailsSaga(
  idPayClient: IDPayClient,
  bearerAuth: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idpayInitiativeGet.request,
    handleGetInitiativeDetails,
    idPayClient.getWalletDetail,
    bearerAuth,
    preferredLanguage
  );

  yield* takeLatest(
    idpayTimelinePageGet.request,
    handleGetTimelinePage,
    idPayClient.getTimeline,
    bearerAuth,
    preferredLanguage
  );

  yield* takeLatest(
    idPayBeneficiaryDetailsGet.request,
    handleGetBeneficiaryDetails,
    idPayClient.getInitiativeBeneficiaryDetail,
    bearerAuth,
    preferredLanguage
  );

  yield* takeLatest(
    idPayOnboardingStatusGet.request,
    handleGetOnboardingStatus,
    idPayClient.onboardingStatus,
    bearerAuth,
    preferredLanguage
  );
}
