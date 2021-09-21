import { ActionType } from "typesafe-actions";
import { delay, Effect, put } from "redux-saga/effects";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { svGenerateVoucherGeneratedVoucher } from "../../store/actions/voucherGeneration";
import { SvVoucherGeneratedResponse } from "../../types/SvVoucherResponse";

/**
 * Handle the remote call to check if the service is alive
 * @param __
 * @param _
 */
// TODO: add client as parameter when the client will be created
export function* handlePostAggiungiVoucher(
  __: SessionManager<MitVoucherToken>,
  _: ActionType<typeof svGenerateVoucherGeneratedVoucher.request>
): Generator<Effect, void> {
  // TODO: add networking logic
  yield delay(500);
  yield put(
    svGenerateVoucherGeneratedVoucher.success({} as SvVoucherGeneratedResponse)
  );
}
