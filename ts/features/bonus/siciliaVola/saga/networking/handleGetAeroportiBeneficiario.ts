import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SagaCallReturnType } from "../../../../../types/utils";
import { isDefined } from "../../../../../utils/guards";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { svGenerateVoucherAvailableDestination } from "../../store/actions/voucherGeneration";
import { AvailableDestinations } from "../../types/SvVoucherRequest";
import { AeroportoSedeBeanList } from "../../../../../../definitions/api_sicilia_vola/AeroportoSedeBeanList";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
const convertSuccess = (
  availableDestinations: AeroportoSedeBeanList
): AvailableDestinations =>
  availableDestinations
    .map(d => (d.denominazione ? d.denominazione : undefined))
    .filter(isDefined);

export function* handleGetAeroportiBeneficiario(
  getAeroportiBeneficiario:
    | ReturnType<typeof BackendSiciliaVolaClient>["getAeroportiBeneficiario"]
    | ReturnType<typeof BackendSiciliaVolaClient>["getAeroportiStato"],
  svSessionManager: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svGenerateVoucherAvailableDestination.request>
) {
  try {
    const request = svSessionManager.withRefresh(
      getAeroportiBeneficiario(action.payload)
    );
    const getAeroportiBeneficiarioResult: SagaCallReturnType<typeof request> =
      yield call(request);

    if (getAeroportiBeneficiarioResult.isRight()) {
      if (getAeroportiBeneficiarioResult.value.status === 200) {
        yield put(
          svGenerateVoucherAvailableDestination.success(
            convertSuccess(getAeroportiBeneficiarioResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getAeroportiBeneficiarioResult.value.status] !== undefined) {
        yield put(
          svGenerateVoucherAvailableDestination.failure({
            ...getGenericError(
              new Error(mapKinds[getAeroportiBeneficiarioResult.value.status])
            )
          })
        );
        return;
      }
    }
    yield put(
      svGenerateVoucherAvailableDestination.failure({
        ...getGenericError(
          new Error("Invalid payload from getAeroportiBeneficiarioResult")
        )
      })
    );
  } catch (e) {
    yield put(
      svGenerateVoucherAvailableDestination.failure({ ...getNetworkError(e) })
    );
  }
}
