import { call } from "redux-saga/effects";
import { executeWorkUnit } from "../../../../../sagas/workUnit";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherCompleted
} from "../../store/actions/voucherGeneration";

/**
 * Define the workflow that allows the user to generate a new voucher.
 * The workflow ends when:
 * - The user send the request to generate a new voucher {@link svGenerateVoucherCompleted}
 * - The user aborts the voucher generation {@link svGenerateVoucherCancel}
 * - The user chooses back from the first screen {@link svGenerateVoucherBack}
 */
function* svVoucherGenerationWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToOnboardingPrivativeChooseBrandScreen(),
    startScreenName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_BRAND,
    complete: svGenerateVoucherCompleted,
    back: svGenerateVoucherBack,
    cancel: svGenerateVoucherCancel
  });
}
