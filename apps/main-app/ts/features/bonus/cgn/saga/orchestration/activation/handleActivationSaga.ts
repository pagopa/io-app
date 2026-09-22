import { CommonActions } from "@react-navigation/native";
import { call, race, take } from "typed-redux-saga/macro";

import NavigationService from "../../../../../../navigation/NavigationService";
import { cgnActivationCancel } from "../../../store/actions/activation";
import { CgnActivationType, cgnActivationWorker } from "./cgnActivationWorker";

/**
 * This saga handles the CGN activation polling
 */
export function* handleCgnActivationSaga(cgnActivationSaga: CgnActivationType) {
  const { cancelAction } = yield* race({
    activation: call(cgnActivationWorker, cgnActivationSaga),
    cancelAction: take(cgnActivationCancel)
  });
  if (cancelAction) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.goBack()
    );
  }
}
