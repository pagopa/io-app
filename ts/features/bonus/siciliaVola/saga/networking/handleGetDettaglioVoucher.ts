import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "redux-saga/effects";
import { svVoucherDetailGet } from "../../store/actions/voucherList";
import { SvVoucher } from "../../types/SvVoucher";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";

/**
 * Handle the remote call to check if the service is alive
 * @param __
 * @param _
 */
// TODO: add client as parameter when the client will be created
export function* handleGetDettaglioVoucher(
  __: SessionManager<MitVoucherToken>,
  _: ActionType<typeof svVoucherDetailGet.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  yield put(svVoucherDetailGet.success({} as SvVoucher));
}
