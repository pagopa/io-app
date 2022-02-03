import { ActionType } from "typesafe-actions";
import { call, put } from "typed-redux-saga/macro";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { svGenerateVoucherAvailableState } from "../../store/actions/voucherGeneration";
import { SagaCallReturnType } from "../../../../../types/utils";
import { StatoUEBeanList } from "../../../../../../definitions/api_sicilia_vola/StatoUEBeanList";
import { State } from "../../types/SvVoucherRequest";
import { isDefined } from "../../../../../utils/guards";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
const convertSuccess = (statiUE: StatoUEBeanList): ReadonlyArray<State> =>
  statiUE
    .map(s =>
      s.id && s.descrizione
        ? {
            id: s.id,
            name: s.descrizione
          }
        : undefined
    )
    .filter(isDefined);

export function* handleGetStatiUE(
  getStatiUE: ReturnType<typeof BackendSiciliaVolaClient>["getStatiUE"],
  _: ActionType<typeof svGenerateVoucherAvailableState.request>
) {
  try {
    const getStatiUEResult: SagaCallReturnType<typeof getStatiUE> = yield* call(
      getStatiUE,
      {}
    );
    if (getStatiUEResult.isRight()) {
      if (getStatiUEResult.value.status === 200) {
        yield* put(
          svGenerateVoucherAvailableState.success(
            convertSuccess(getStatiUEResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getStatiUEResult.value.status] !== undefined) {
        yield* put(
          svGenerateVoucherAvailableState.failure({
            ...getGenericError(
              new Error(mapKinds[getStatiUEResult.value.status])
            )
          })
        );
        return;
      }
    }
    yield* put(
      svGenerateVoucherAvailableState.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield* put(
      svGenerateVoucherAvailableState.failure({ ...getNetworkError(e) })
    );
  }
}
