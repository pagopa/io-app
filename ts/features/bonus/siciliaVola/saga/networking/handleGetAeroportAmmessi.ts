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

const mapKinds: Record<number, string> = {
  400: "wrongFormat",
  500: "ServerError"
};

// convert a success response to the logical app representation of it
const convertSuccess = (
  availableDestinations: AeroportoSedeBeanList
): AvailableDestinations =>
  availableDestinations
    .map(d => (d.denominazione ? d.denominazione : undefined))
    .filter(isDefined);

export function* handleGetAeroportiAmmessi(
  getAeroportiAmmessi: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getAeroportiAmmessi"],
  svSessionManager: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svGenerateVoucherAvailableDestination.request>
) {
  try {
    const request = svSessionManager.withRefresh(
      getAeroportiAmmessi(action.payload)
    );
    const getAeroportiAmmessiResult: SagaCallReturnType<typeof request> =
      yield call(request);

    if (getAeroportiAmmessiResult.isRight()) {
      if (getAeroportiAmmessiResult.value.status === 200) {
        yield put(
          svGenerateVoucherAvailableDestination.success(
            convertSuccess(getAeroportiAmmessiResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getAeroportiAmmessiResult.value.status] !== undefined) {
        yield put(
          svGenerateVoucherAvailableDestination.failure({
            ...getGenericError(
              new Error(mapKinds[getAeroportiAmmessiResult.value.status])
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
