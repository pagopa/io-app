import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import {
  cgnActivationStart,
  cgnRequestActivation
} from "../store/actions/activation";
import { apiUrlPrefix } from "../../../../config";
import { BackendCGN } from "../api/backendCgn";
import { cgnDetails } from "../store/actions/details";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnGenerateOtp as cgnGenerateOtpAction } from "../store/actions/otp";
import {
  cgnEycaActivation,
  cgnEycaActivationStatusRequest
} from "../store/actions/eyca/activation";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSelectedMerchant
} from "../store/actions/merchants";
import { BackendCgnMerchants } from "../api/backendCgnMerchants";
import { cgnCodeFromBucket } from "../store/actions/bucket";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import { cgnCategories } from "../store/actions/categories";
import { handleCgnStartActivationSaga } from "./orchestration/activation/activationSaga";
import { handleCgnActivationSaga } from "./orchestration/activation/handleActivationSaga";
import {
  cgnActivationSaga,
  handleCgnStatusPolling
} from "./networking/activation/getBonusActivationSaga";
import { cgnGetInformationSaga } from "./networking/details/getCgnInformationSaga";
import { handleGetEycaStatus } from "./networking/eyca/details/getEycaStatus";
import { cgnGenerateOtp } from "./networking/otp";
import { getEycaActivationStatusSaga } from "./networking/eyca/activation/getEycaActivationStatus";
import { eycaActivationSaga } from "./orchestration/eyca/eycaActivationSaga";
import {
  cgnMerchantDetail,
  cgnOfflineMerchantsSaga,
  cgnOnlineMerchantsSaga
} from "./networking/merchants/cgnMerchantsSaga";
import { cgnBucketConsuption } from "./networking/bucket";
import { cgnUnsubscriptionHandler } from "./networking/unsubscribe";
import { cgnCategoriesSaga } from "./networking/categories/cgnCategoriesSaga";

export function* watchBonusCgnSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendCGN = BackendCGN(apiUrlPrefix, bearerToken);
  const backendCgnMerchants = BackendCgnMerchants(apiUrlPrefix, bearerToken);

  // CGN Activation request with status polling
  yield* takeLatest(
    cgnRequestActivation,
    handleCgnActivationSaga,
    cgnActivationSaga(
      backendCGN.startCgnActivation,
      handleCgnStatusPolling(backendCGN.getCgnActivation)
    )
  );

  // CGN Activation workflow
  yield* takeLatest(cgnActivationStart, handleCgnStartActivationSaga);

  // CGN Load details
  yield* takeLatest(
    cgnDetails.request,
    cgnGetInformationSaga,
    backendCGN.getCgnStatus
  );

  // Eyca get status
  yield* takeLatest(
    cgnEycaStatus.request,
    handleGetEycaStatus,
    backendCGN.getEycaStatus
  );

  // Eyca Activation
  yield* takeLatest(
    cgnEycaActivation.request,
    eycaActivationSaga,
    backendCGN.getEycaActivation,
    backendCGN.startEycaActivation
  );

  // Eyca Activation Status
  yield* takeLatest(
    cgnEycaActivationStatusRequest,
    getEycaActivationStatusSaga,
    backendCGN.getEycaActivation
  );

  // CGN Otp generation
  yield* takeLatest(
    cgnGenerateOtpAction.request,
    cgnGenerateOtp,
    backendCGN.generateOtp
  );

  // CGN Unsubscription
  yield* takeLatest(
    cgnUnsubscribe.request,
    cgnUnsubscriptionHandler,
    backendCGN.startCgnUnsubscription
  );
  // CGN Merchants categories
  yield* takeLatest(
    cgnCategories.request,
    cgnCategoriesSaga,
    backendCgnMerchants.getPublishedCategories
  );

  // CGN Offline Merchants
  yield* takeLatest(
    cgnOfflineMerchants.request,
    cgnOfflineMerchantsSaga,
    backendCgnMerchants.getOfflineMerchants
  );

  // CGN Online Merchants
  yield* takeLatest(
    cgnOnlineMerchants.request,
    cgnOnlineMerchantsSaga,
    backendCgnMerchants.getOnlineMerchants
  );

  // CGN get selected Merchant detail
  yield* takeLatest(
    cgnSelectedMerchant.request,
    cgnMerchantDetail,
    backendCgnMerchants.getMerchant
  );

  // CGN Bucket Code consuption
  yield* takeLatest(
    cgnCodeFromBucket.request,
    cgnBucketConsuption,
    backendCgnMerchants.getDiscountBucketCode
  );
}
