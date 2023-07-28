import { takeLatest, call } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import { itwActivationStart, itwWiaRequest } from "../store/actions";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../navigation/routes";
import { itwCredentialsAddPid, itwPid } from "../store/actions/credentials";
import { authenticationSaga } from "./authenticationSaga";
import { handlePidRequest } from "./pid";
import { handleWiaRequest } from "./wia";
import { handleCredentialsAddPid } from "./credentials";

export function* watchItwSaga(): SagaIterator {
  yield* takeLatest(itwActivationStart, watchItwActivationStart);

  /**
   * Handles the wallet instance attestation issuing.
   */
  yield* takeLatest(itwWiaRequest.request, handleWiaRequest);

  /**
   * Handles a PID issuing request.
   */
  yield* takeLatest(itwPid.request, handlePidRequest);

  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid, handleCredentialsAddPid);
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
