import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { StatoUEBeanList } from "../../../../../../definitions/api_sicilia_vola/StatoUEBeanList";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { isDefined } from "../../../../../utils/guards";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svGenerateVoucherAvailableState } from "../../store/actions/voucherGeneration";
import { State } from "../../types/SvVoucherRequest";

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
    if (E.isRight(getStatiUEResult)) {
      if (getStatiUEResult.right.status === 200) {
        yield* put(
          svGenerateVoucherAvailableState.success(
            convertSuccess(getStatiUEResult.right.value)
          )
        );
        return;
      }
      if (mapKinds[getStatiUEResult.right.status] !== undefined) {
        yield* put(
          svGenerateVoucherAvailableState.failure({
            ...getGenericError(
              new Error(mapKinds[getStatiUEResult.right.status])
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
