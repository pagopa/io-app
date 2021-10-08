import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "redux-saga/effects";
import {
  svVoucherListGet,
  svVoucherRevocation
} from "../../store/actions/voucherList";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { navigateBack } from "../../../../../store/actions/navigation";

/**
 * Handle the remote call to check if the service is alive
 * @param __
 * @param _
 */
// TODO: add client as parameter when the client will be created
export function* handleVoucherRevocation(
  __: SessionManager<MitVoucherToken>,
  _: ActionType<typeof svVoucherRevocation.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  yield put(svVoucherRevocation.success());

  yield put(navigateBack());
  // TODO: handle filter
  yield put(svVoucherListGet.request({}));
}
