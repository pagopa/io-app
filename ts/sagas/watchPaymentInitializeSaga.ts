import { Effect, put, select, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import {
  paymentInitializeEntrypointRoute,
  paymentInitializeState
} from "../store/actions/wallet/payment";
import {
  getCurrentRouteKey,
  getCurrentRouteName
} from "../store/middlewares/analytics";
import { GlobalState } from "../store/reducers/types";

/**
 * This saga track each time a new payment of the route from which it started is initiated
 */
export function* watchPaymentInitializeSaga(): Iterator<Effect> {
  yield takeEvery(getType(paymentInitializeState), function*() {
    const nav: GlobalState["nav"] = yield select<GlobalState>(_ => _.nav);
    const currentRouteName = getCurrentRouteName(nav);
    const currentRouteKey = getCurrentRouteKey(nav);
    if (currentRouteName !== undefined && currentRouteKey !== undefined) {
      yield put(
        paymentInitializeEntrypointRoute({
          name: currentRouteName,
          key: currentRouteKey
        })
      );
    }
  });
}
