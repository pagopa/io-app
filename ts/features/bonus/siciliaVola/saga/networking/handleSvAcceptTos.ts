import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "redux-saga/effects";
import { svAcceptTos } from "../../store/actions/activation";

/**
 * Handle the remote call to check if the service is alive
 * @param _
 */
export function* handleSvAccepTos(
  _: ActionType<typeof svAcceptTos.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  yield put(svAcceptTos.success(true));
}
