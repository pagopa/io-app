import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { AeroportoSedeBeanList } from "../../../../../../definitions/api_sicilia_vola/AeroportoSedeBeanList";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { isDefined } from "../../../../../utils/guards";
import { SessionManager } from "../../../../../utils/SessionManager";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svGenerateVoucherAvailableDestination } from "../../store/actions/voucherGeneration";
import { AvailableDestinations } from "../../types/SvVoucherRequest";

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
      yield* call(request);

    if (E.isRight(getAeroportiAmmessiResult)) {
      if (getAeroportiAmmessiResult.right.status === 200) {
        yield* put(
          svGenerateVoucherAvailableDestination.success(
            convertSuccess(getAeroportiAmmessiResult.right.value)
          )
        );
        return;
      }
      if (mapKinds[getAeroportiAmmessiResult.right.status] !== undefined) {
        yield* put(
          svGenerateVoucherAvailableDestination.failure({
            ...getGenericError(
              new Error(mapKinds[getAeroportiAmmessiResult.right.status])
            )
          })
        );
        return;
      }
    }
    yield* put(
      svGenerateVoucherAvailableDestination.failure({
        ...getGenericError(
          new Error("Invalid payload from getAeroportiBeneficiarioResult")
        )
      })
    );
  } catch (e) {
    yield* put(
      svGenerateVoucherAvailableDestination.failure({ ...getNetworkError(e) })
    );
  }
}
