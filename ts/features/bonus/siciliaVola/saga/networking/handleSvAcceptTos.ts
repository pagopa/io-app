import { ActionType } from "typesafe-actions";
import { delay, put } from "typed-redux-saga/macro";
import { svAcceptTos } from "../../store/actions/activation";
import { ReduxSagaEffect } from "../../../../../types/utils";

/**
 * Handle the remote call to check if the service is alive
 * @param _
 */
export function* handleSvAccepTos(
  _: ActionType<typeof svAcceptTos.request>
): Generator<ReduxSagaEffect, void> {
  // TODO: add networking logic
  yield* delay(500);
  yield* put(svAcceptTos.success(true));
}
