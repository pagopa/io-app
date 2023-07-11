import { takeLatest, call } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";
import { CommonActions } from "@react-navigation/native";
import { itwActivationStart } from "../store/actions";
import NavigationService from "../../../navigation/NavigationService";
import { ITW_ROUTES } from "../navigation/routes";
import { authenticationSaga } from "./authenticationSaga";

export function* watchItwSaga(): SagaIterator {
  yield* takeLatest(itwActivationStart, watchItwActivationStart);
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
