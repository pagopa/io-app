import { ActionType } from "typesafe-actions";
import { call, put } from "redux-saga/effects";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { svGenerateVoucherAvailableMunicipality } from "../../store/actions/voucherGeneration";
import { SagaCallReturnType } from "../../../../../types/utils";
import { Municipality } from "../../types/SvVoucherRequest";
import { ComuneBeanList } from "../../../../../../definitions/api_sicilia_vola/ComuneBeanList";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
const convertSuccess = (
  listaComuni: ComuneBeanList
): ReadonlyArray<Municipality> =>
  listaComuni.flatMap(r =>
    r.codiceCatastale && r.descrizioneComune
      ? [
          {
            id: r.codiceCatastale,
            name: r.descrizioneComune
          }
        ]
      : []
  );

export function* handleGetListaComuniBySiglaProvincia(
  getListaComuni: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getListaComuniBySiglaProvincia"],
  action: ActionType<typeof svGenerateVoucherAvailableMunicipality.request>
) {
  try {
    const getListaComuniResult: SagaCallReturnType<typeof getListaComuni> =
      yield call(getListaComuni, { siglaProvincia: action.payload });

    if (getListaComuniResult.isRight()) {
      if (getListaComuniResult.value.status === 200) {
        yield put(
          svGenerateVoucherAvailableMunicipality.success(
            convertSuccess(getListaComuniResult.value.value)
          )
        );
        return;
      }
      if (mapKinds[getListaComuniResult.value.status] !== undefined) {
        yield put(
          svGenerateVoucherAvailableMunicipality.failure({
            ...getGenericError(
              new Error(mapKinds[getListaComuniResult.value.status])
            )
          })
        );
        return;
      }
    }
    yield put(
      svGenerateVoucherAvailableMunicipality.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield put(
      svGenerateVoucherAvailableMunicipality.failure({ ...getNetworkError(e) })
    );
  }
}
