import { takeLatest, call } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import {
  itwActivationStart,
  itwCredentialsAddPid,
  itwWiaRequest
} from "../store/actions";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../navigation/routes";
import { authenticationSaga } from "./authenticationSaga";
import { handleCredentialsAddPid } from "./handleCredentials";
import { handleWiaRequest } from "./handleWiaRequest";

export function* watchItwSaga(): SagaIterator {
  yield* takeLatest(itwActivationStart, watchItwActivationStart);

  /**
   * Handles the wallet instance attestation issuing.
   */
  yield* takeLatest(itwWiaRequest.request, handleWiaRequest);

  /**
   * Handles adding a PID to the ITW credentials.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

function* watchItwActivationStart(): SagaIterator {
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ACTIVATION.DETAILS
    })
  );
  yield* call(authenticationSaga);
}
