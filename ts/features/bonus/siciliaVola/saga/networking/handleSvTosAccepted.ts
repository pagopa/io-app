import { ActionType } from "typesafe-actions";
import { delay, put } from "typed-redux-saga/macro";
import { svTosAccepted } from "../../store/actions/activation";
import { ReduxSagaEffect } from "../../../../../types/utils";

/**
 * Handle the remote call to check if the service is alive
 * @param _
 */
export function* handleSvTosAccepted(
  _: ActionType<typeof svTosAccepted.request>
): Generator<ReduxSagaEffect, void> {
  // TODO: add networking logic
  yield* delay(500);
  yield* put(svTosAccepted.success(true));
}
