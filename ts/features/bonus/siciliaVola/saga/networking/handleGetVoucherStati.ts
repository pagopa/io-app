import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../../types/utils";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SessionManager } from "../../../../../utils/SessionManager";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svPossibleVoucherStateGet } from "../../store/actions/voucherList";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

export function* handleGetVoucheStati(
  getStatiVoucher: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getStatiVoucher"],
  _: SessionManager<MitVoucherToken>,
  __: ActionType<typeof svPossibleVoucherStateGet.request>
) {
  try {
    yield* call(waitBackoffError, svPossibleVoucherStateGet.failure);

    // TODO: add MitVoucherToken
    const getStatiVoucherResult: SagaCallReturnType<typeof getStatiVoucher> =
      yield* call(getStatiVoucher, {});

    if (E.isRight(getStatiVoucherResult)) {
      if (getStatiVoucherResult.right.status === 200) {
        yield* put(
          svPossibleVoucherStateGet.success(getStatiVoucherResult.right.value)
        );
        return;
      }
      if (mapKinds[getStatiVoucherResult.right.status] !== undefined) {
        yield* put(
          svPossibleVoucherStateGet.failure({
            ...getGenericError(
              new Error(mapKinds[getStatiVoucherResult.right.status])
            )
          })
        );
        return;
      }
    }
    yield* put(
      svPossibleVoucherStateGet.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield* put(svPossibleVoucherStateGet.failure(getNetworkError(e)));
  }
}
