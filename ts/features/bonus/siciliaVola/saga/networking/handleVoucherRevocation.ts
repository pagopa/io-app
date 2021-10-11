import { ActionType } from "typesafe-actions";
import { call, delay, Effect, put } from "redux-saga/effects";
import {
  svVoucherListGet,
  svVoucherRevocation
} from "../../store/actions/voucherList";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { navigateBack } from "../../../../../store/actions/navigation";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { SagaCallReturnType } from "../../../../../types/utils";

/**
 * Handle the voucher revocation
 * @param postAnnullaVoucher
 * @param svSessionManager
 * @param action
 */
// TODO: add client as parameter when the client will be created
export function* handleVoucherRevocation(
  postAnnullaVoucher: ReturnType<
    typeof BackendSiciliaVolaClient
  >["postAnnullaVoucher"],
  svSessionManager: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svVoucherRevocation.request>
): Generator<Effect, void> {
  const request = svSessionManager.withRefresh(
    postAnnullaVoucher(action.payload)
  );
  try {
    const postAnnullaVoucherResult: SagaCallReturnType<typeof request> =
      yield call(request());

    if (postAnnullaVoucherResult.isRight()) {
    }
    // TODO: add networking logic
    yield delay(500);
    yield put(svVoucherRevocation.success());
    // yield put(svVoucherRevocation.failure({} as GenericError));

    yield put(navigateBack());
    // TODO: handle filter
    yield put(svVoucherListGet.request({}));
  } catch (e) {}
}
