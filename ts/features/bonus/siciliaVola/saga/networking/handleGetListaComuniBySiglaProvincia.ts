import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ComuneBeanList } from "../../../../../../definitions/api_sicilia_vola/ComuneBeanList";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svGenerateVoucherAvailableMunicipality } from "../../store/actions/voucherGeneration";
import { Municipality } from "../../types/SvVoucherRequest";

// TODO: add the mapping when the swagger will be fixed
const mapKinds: Record<number, string> = {};

// convert a success response to the logical app representation of it
// TODO: remove the mock when the swagger is completed
const convertSuccess = (
  listaComuni: ComuneBeanList
): ReadonlyArray<Municipality> =>
  listaComuni.flatMap(r =>
    r.codiceCatastale && r.descrizioneComune
      ? [
          {
            id: r.codiceCatastale,
            name: r.descrizioneComune,
            latitude: 1,
            longitude: 1
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
      yield* call(getListaComuni, { siglaProvincia: action.payload });

    if (E.isRight(getListaComuniResult)) {
      if (getListaComuniResult.right.status === 200) {
        yield* put(
          svGenerateVoucherAvailableMunicipality.success(
            convertSuccess(getListaComuniResult.right.value)
          )
        );
        return;
      }
      if (mapKinds[getListaComuniResult.right.status] !== undefined) {
        yield* put(
          svGenerateVoucherAvailableMunicipality.failure({
            ...getGenericError(
              new Error(mapKinds[getListaComuniResult.right.status])
            )
          })
        );
        return;
      }
    }
    yield* put(
      svGenerateVoucherAvailableMunicipality.failure({
        ...getGenericError(new Error("Generic Error"))
      })
    );
  } catch (e) {
    yield* put(
      svGenerateVoucherAvailableMunicipality.failure({ ...getNetworkError(e) })
    );
  }
}
