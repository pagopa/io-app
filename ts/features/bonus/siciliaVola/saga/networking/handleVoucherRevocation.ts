import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SessionManager } from "../../../../../utils/SessionManager";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svVoucherRevocation } from "../../store/actions/voucherList";

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
      yield* call(request);

    if (E.isRight(postAnnullaVoucherResult)) {
      if (postAnnullaVoucherResult.right.status === 200) {
        yield* put(svVoucherRevocation.success());
        return;
      }
      yield* put(
        svVoucherRevocation.failure(
          getGenericError(
            new Error(
              `response status ${postAnnullaVoucherResult.right.status}`
            )
          )
        )
      );
      return;
    }
    yield* put(
      svVoucherRevocation.failure(getGenericError(new Error("Generic Error")))
    );
  } catch (e) {
    yield* put(svVoucherRevocation.failure(getNetworkError(e)));
  }
}
