import { ActionType } from "typesafe-actions";
import { call, put, select } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SagaCallReturnType } from "../../../../../types/utils";
import { isDefined } from "../../../../../utils/guards";
import { svVoucherListGet } from "../../store/actions/voucherList";
import { ListaVoucherBeneficiarioOutputBean } from "../../../../../../definitions/api_sicilia_vola/ListaVoucherBeneficiarioOutputBean";
import { SvVoucherListResponse } from "../../types/SvVoucherResponse";
import { SvVoucherId } from "../../types/SvVoucher";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { svVouchersListUiSelector } from "../../store/reducers/voucherList/ui";
import { waitBackoffError } from "../../../../../utils/backoffError";

// convert a success response to the logical app representation of it
const convertSuccess = (
  voucherBeneficiario: ListaVoucherBeneficiarioOutputBean
): SvVoucherListResponse => {
  if (voucherBeneficiario.listaRisultati) {
    return voucherBeneficiario.listaRisultati
      .map(v =>
        v.idVoucher !== undefined &&
        v.aeroportoDest !== undefined &&
        v.dataVolo !== undefined
          ? {
              idVoucher: v.idVoucher as SvVoucherId,
              departureDate: v.dataVolo,
              destination: v.aeroportoDest
            }
          : undefined
      )
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
  const pagination = true;
  const elementsXPage = 10;

  try {
    yield call(waitBackoffError, svVoucherListGet.failure);
    const { nextPage }: ReturnType<typeof svVouchersListUiSelector> =
      yield select(svVouchersListUiSelector);

    // TODO: add MitVoucherToken
    const getVoucherBeneficiarioResult: SagaCallReturnType<
      typeof getVoucherBeneficiario
    > = yield call(getVoucherBeneficiario, {
      ...action.payload,
      pagination,
      pageNum: nextPage,
      elementsXPage
    });

    if (getVoucherBeneficiarioResult.isRight()) {
      if (getVoucherBeneficiarioResult.value.status === 200) {
        yield put(
          svVoucherListGet.success(
            convertSuccess(getVoucherBeneficiarioResult.value.value)
          )
        );
        return;
      }

      // TODO: manage error case and dispatch of last page when the swagger will be updated
      if (getVoucherBeneficiarioResult.value.status === 500) {
        yield put(svVoucherListGet.success([]));
        return;
      }
    }
    yield put(
      svVoucherListGet.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield put(svVoucherListGet.failure({ ...getNetworkError(e) }));
  }
}
