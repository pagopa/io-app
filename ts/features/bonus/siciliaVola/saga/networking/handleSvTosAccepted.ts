import { ActionType } from "typesafe-actions";
import { delay, put } from "typed-redux-saga";
import { Effect } from "redux-saga/effects";
import { svTosAccepted } from "../../store/actions/activation";

/**
 * Handle the remote call to check if the service is alive
 * @param _
 */
export function* handleSvTosAccepted(
  _: ActionType<typeof svTosAccepted.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield* delay(500);
  yield* put(svTosAccepted.success(true));
}
