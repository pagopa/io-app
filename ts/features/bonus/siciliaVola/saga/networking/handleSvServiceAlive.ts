import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "typed-redux-saga";
import { svServiceAlive } from "../../store/actions/activation";

/**
 * Handle the remote call to check if the service is alive
 * @param _
 */
export function* handleSvServiceAlive(
  _: ActionType<typeof svServiceAlive.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  yield put(svServiceAlive.success(true));
}
