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
  bpdToken: string,
  preferredLanguage: PreferredLanguageEnum
): SagaIterator {
  yield* takeLatest(
    idpayInitiativeGet.request,
    handleGetInitiativeDetails,
    idPayClient.getWalletDetail,
    bpdToken,
    preferredLanguage
  );

  yield* takeLatest(
    idpayTimelinePageGet.request,
    handleGetTimelinePage,
    idPayClient.getTimeline,
    bpdToken,
    preferredLanguage
  );

  yield* takeLatest(
    idPayBeneficiaryDetailsGet.request,
    handleGetBeneficiaryDetails,
    idPayClient.getInitiativeBeneficiaryDetail,
    bpdToken,
    preferredLanguage
  );

  yield* takeLatest(
    idPayOnboardingStatusGet.request,
    handleGetOnboardingStatus,
    idPayClient.onboardingStatus,
    bpdToken,
    preferredLanguage
  );
}
