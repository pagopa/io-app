import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete
} from "../../../store/actions/activation";
import { navigateToCgnActivationInformationTos } from "../../../navigation/actions";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import CGN_ROUTES from "../../../navigation/routes";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";

function* cgnActivationWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToCgnActivationInformationTos(),
    startScreenName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS,
    complete: cgnActivationComplete,
    back: cgnActivationBack,
    cancel: cgnActivationCancel
  });
}

/**
 * This saga handles the CGN activation workflow
 */
export function* handleCgnStartActivationSaga(): SagaIterator {
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    cgnActivationWorkUnit
  );
  if (res !== "back") {
    yield put(navigateToWalletHome());
  }
}
