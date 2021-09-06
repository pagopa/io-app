import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SagaCallReturnType } from "../../../../../types/utils";
import {
  svPossibleVoucherStateGet,
  svVoucherListGet
} from "../../store/actions/voucherList";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";

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
    // TODO: add MitVoucherToken
    const getStatiVoucherResult: SagaCallReturnType<typeof getStatiVoucher> = yield call(
      getStatiVoucher,
      {}
    );

    if (getStatiVoucherResult.isRight()) {
      if (getStatiVoucherResult.value.status === 200) {
        yield put(
          svPossibleVoucherStateGet.success(getStatiVoucherResult.value.value)
        );
        return;
      }
      if (mapKinds[getStatiVoucherResult.value.status] !== undefined) {
        yield put(
          svPossibleVoucherStateGet.failure({
            ...getGenericError(
              new Error(mapKinds[getStatiVoucherResult.value.status])
            )
          })
        );
        return;
      }
    }
    yield put(
      svPossibleVoucherStateGet.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield put(svVoucherListGet.failure({ ...getNetworkError(e) }));
  }
}
