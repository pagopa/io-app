import { ActionType } from "typesafe-actions";
import { call, put, select } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SagaCallReturnType } from "../../../../../types/utils";
import { isDefined } from "../../../../../utils/guards";
import {
  svRequestVoucherPage,
  svResetFilter,
  svSetFilter,
  svVoucherListGet
} from "../../store/actions/voucherList";
import { ListaVoucherBeneficiarioOutputBean } from "../../../../../../definitions/api_sicilia_vola/ListaVoucherBeneficiarioOutputBean";
import { SvVoucherListResponse } from "../../types/SvVoucherResponse";
import { SvVoucherId } from "../../types/SvVoucher";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { svVouchersListUiSelector } from "../../store/reducers/voucherList/ui";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

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
  action:
    | ActionType<typeof svSetFilter>
    | ActionType<typeof svResetFilter>
    | ActionType<typeof svRequestVoucherPage>
) {
  try {
    const {
      nextPage,
      pagination,
      elementNumber
    }: ReturnType<typeof svVouchersListUiSelector> = yield select(
      svVouchersListUiSelector
    );

    // TODO: add MitVoucherToken
    const getVoucherBeneficiarioResult: SagaCallReturnType<typeof getVoucherBeneficiario> = yield call(
      getVoucherBeneficiario,
      {
        ...action.payload,
        pagination,
        pageNum: nextPage,
        elementsXPage: elementNumber
      }
    );

    if (getVoucherBeneficiarioResult.isRight()) {
      if (getVoucherBeneficiarioResult.value.status === 200) {
        yield put(
          svVoucherListGet.success(
            convertSuccess(getVoucherBeneficiarioResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getVoucherBeneficiarioResult.value.status] !== undefined) {
        yield put(
          svVoucherListGet.failure({
            ...getGenericError(
              new Error(mapKinds[getVoucherBeneficiarioResult.value.status])
            )
          })
        );
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
