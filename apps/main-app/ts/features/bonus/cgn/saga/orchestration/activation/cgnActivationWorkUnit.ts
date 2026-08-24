import { call } from "typed-redux-saga/macro";

import { executeWorkUnit } from "../../../../../../sagas/workUnit";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure
} from "../../../store/actions/activation";
import { navigateToCgnActivationInformationTos } from "../navigation/actions";

export function* cgnActivationWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToCgnActivationInformationTos,
    startScreenName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS,
    complete: cgnActivationComplete,
    back: cgnActivationBack,
    cancel: cgnActivationCancel,
    failure: cgnActivationFailure
  });
}
