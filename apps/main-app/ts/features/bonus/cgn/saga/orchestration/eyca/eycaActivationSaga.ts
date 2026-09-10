import { CommonActions } from "@react-navigation/native";
import { call, race, take } from "typed-redux-saga/macro";

import NavigationService from "../../../../../../navigation/NavigationService";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnEycaActivationCancel } from "../../../store/actions/eyca/activation";
import { eycaActivationWorker } from "./eycaActivationWorker";

/** This saga handles the CGN activation polling */
export function* eycaActivationSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
) {
  // This is not using typed-redux-saga because
  // there is a particular generator delegation which
  // cannot use `yield*` to work.
  const { cancelAction } = yield* race({
    activation: call(
      eycaActivationWorker,
      getEycaActivation,
      startEycaActivation
    ),
    cancelAction: take(cgnEycaActivationCancel)
  });

  if (cancelAction) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.goBack()
    );
  }
}
