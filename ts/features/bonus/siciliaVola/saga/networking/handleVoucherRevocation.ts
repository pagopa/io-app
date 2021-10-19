import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import { svVoucherRevocation } from "../../store/actions/voucherList";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";

/**
 * Handle the voucher revocation
 * @param postAnnullaVoucher
 * @param svSessionManager
 * @param action
 */
export function* handleVoucherRevocation(
  postAnnullaVoucher: ReturnType<
    typeof BackendSiciliaVolaClient
  >["postAnnullaVoucher"],
  svSessionManager: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svVoucherRevocation.request>
) {
  try {
    const request = svSessionManager.withRefresh(
      postAnnullaVoucher({ codiceVoucher: action.payload })
    );
    const postAnnullaVoucherResult: SagaCallReturnType<typeof request> =
      yield call(request);

    if (postAnnullaVoucherResult.isRight()) {
      if (postAnnullaVoucherResult.value.status === 200) {
        yield put(svVoucherRevocation.success());
        return;
      }
      yield put(
        svVoucherRevocation.failure(
          getGenericError(
            new Error(
              `response status ${postAnnullaVoucherResult.value.status}`
            )
          )
        )
      );
      return;
    }
    yield put(
      svVoucherRevocation.failure(getGenericError(new Error("Generic Error")))
    );
  } catch (e) {
    yield put(svVoucherRevocation.failure(getNetworkError(e)));
  }
}
