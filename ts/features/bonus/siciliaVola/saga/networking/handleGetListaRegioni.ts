import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { svGenerateVoucherAvailableRegion } from "../../store/actions/voucherGeneration";
import { SagaCallReturnType } from "../../../../../types/utils";
import { Region } from "../../types/SvVoucherRequest";
import { isDefined } from "../../../../../utils/guards";
import { ProvinciaBeanList } from "../../../../../../definitions/api_sicilia_vola/ProvinciaBeanList";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
const convertSuccess = (
  listaRegioni: ProvinciaBeanList
): ReadonlyArray<Region> =>
  listaRegioni
    .map(r =>
      r.idRegione && r.regione
        ? {
            id: r.idRegione,
            name: r.regione
          }
        : undefined
    )
    .filter(isDefined);

export function* handleGetListaRegioni(
  getListaRegioni: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getListaRegioni"],
  _: ActionType<typeof svGenerateVoucherAvailableRegion.request>
) {
  try {
    const getListaRegioniResult: SagaCallReturnType<typeof getListaRegioni> =
      yield call(getListaRegioni, {});
    if (getListaRegioniResult.isRight()) {
      if (getListaRegioniResult.value.status === 200) {
        yield put(
          svGenerateVoucherAvailableRegion.success(
            convertSuccess(getListaRegioniResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getListaRegioniResult.value.status] !== undefined) {
        yield put(
          svGenerateVoucherAvailableRegion.failure({
            ...getGenericError(
              new Error(mapKinds[getListaRegioniResult.value.status])
            )
          })
        );
        return;
      }
    }
    yield put(
      svGenerateVoucherAvailableRegion.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield put(
      svGenerateVoucherAvailableRegion.failure({ ...getNetworkError(e) })
    );
  }
}
