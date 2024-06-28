import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import { take, takeLatest, call } from "typed-redux-saga/macro";
import { itwLoginSuccess, itwNfcIsEnabled } from "../store/actions";
import NavigationService from "../../../../navigation/NavigationService";
import { ITW_ROUTES } from "../../navigation/routes";
import { handleNfcEnabledSaga } from "./handleNfcEnabledSaga";

// TODO: temporary saga to test the flow
function* handleStartAuthenticationSaga() {
  const action = yield* take(itwLoginSuccess);

  // eslint-disable-next-line no-console
  console.log(action.payload);

  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    })
  );
}

export function* watchItwIdentificationSaga(): SagaIterator {
  yield* takeLatest(itwNfcIsEnabled.request, handleNfcEnabledSaga);
  yield* call(handleStartAuthenticationSaga);
}
