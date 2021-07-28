import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { call, put } from "redux-saga/effects";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SagaCallReturnType } from "../../../../../types/utils";
import { isDefined } from "../../../../../utils/guards";
import { ActionType } from "typesafe-actions";
import { svVoucherListGet } from "../../store/actions/voucherList";
import { ListaVoucherBeneficiarioOutputBean } from "../../../../../../definitions/api_sicilia_vola/ListaVoucherBeneficiarioOutputBean";
import { SvVoucherListResponse } from "../../types/SvVoucherResponse";
import { SvVoucherId } from "../../types/SvVoucher";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
const convertSuccess = (
  voucherBeneficiario: ListaVoucherBeneficiarioOutputBean
): SvVoucherListResponse => {
  if (voucherBeneficiario.listaRisultati) {
    return voucherBeneficiario.listaRisultati
      .map(v => {
        return v.idVoucher && v.aeroportoDest && v.dataVolo
          ? {
              idVoucher: v.idVoucher as SvVoucherId,
              departureDate: v.dataVolo,
              destination: v.aeroportoDest
            }
          : undefined;
      })
      .filter(isDefined);
  } else {
    return [];
  }
};

export function* handleGetVoucherBeneficiario(
  getVoucherBeneficiario: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getVoucherBeneficiario"],
  _: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svVoucherListGet.request>
) {
  try {
    // TODO: add MitVoucherToken
    const getVoucherBeneficiarioResult: SagaCallReturnType<typeof getVoucherBeneficiario> = yield call(
      getVoucherBeneficiario,
      action.payload
    );

    if (getVoucherBeneficiarioResult.isRight()) {
      if (getVoucherBeneficiarioResult.value.status === 200) {
        yield put(
          svVoucherListGet.success(
            convertSuccess(getVoucherBeneficiarioResult.value.value)
          )
        );
      }
      if (mapKinds[getVoucherBeneficiarioResult.value.status] !== undefined) {
        yield put(
          svVoucherListGet.failure({
            ...getGenericError(
              new Error(mapKinds[getVoucherBeneficiarioResult.value.status])
            )
          })
        );
      }
    } else {
      // cannot decode response
      yield put(
        svVoucherListGet.failure({
          ...getGenericError(new Error("Generic Error"))
        })
      );
    }
  } catch (e) {
    yield put(svVoucherListGet.failure({ ...getNetworkError(e) }));
  }
}
