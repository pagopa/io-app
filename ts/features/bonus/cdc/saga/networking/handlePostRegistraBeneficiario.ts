import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendCdcClient } from "../../api/backendCdc";
import { cdcEnrollUserToBonus } from "../../store/actions/cdcBonusRequest";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { AnniRiferimento } from "../../../../../../definitions/cdc/AnniRiferimento";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import {
  CdcBonusEnrollmentList,
  CdcBonusEnrollmentOutcomeList
} from "../../types/CdcBonusRequest";
import { isTestEnv } from "../../../../../utils/environment";

const convertSuccess = (
  listaEsitoRichiestaPerAnno: ListaEsitoRichiestaPerAnno
): CdcBonusEnrollmentOutcomeList =>
  listaEsitoRichiestaPerAnno.listaEsitoRichiestaPerAnno.map(o => ({
    year: o.annoRiferimento,
    outcome: o.esitoRichiesta
  }));

const convertRequestPayload = (
  actionPayload: CdcBonusEnrollmentList
): { anniRiferimento: AnniRiferimento } => ({
  anniRiferimento: {
    anniRif: actionPayload.map(y => ({
      anno: y.year
    }))
  }
});

export function* handlePostRegistraBeneficiario(
  postRegistraBeneficiario: BackendCdcClient["postRegistraBeneficiario"],
  action: ActionType<typeof cdcEnrollUserToBonus.request>
) {
  try {
    const postRegistraBeneficiarioResult = yield* call(
      postRegistraBeneficiario,
      convertRequestPayload(action.payload)
    );

    if (postRegistraBeneficiarioResult.isRight()) {
      if (postRegistraBeneficiarioResult.value.status === 200) {
        yield* put(
          cdcEnrollUserToBonus.success(
            convertSuccess(postRegistraBeneficiarioResult.value.value)
          )
        );
        return;
      }
      if (postRegistraBeneficiarioResult.value.status === 400) {
        yield* put(
          cdcEnrollUserToBonus.failure(
            getGenericError(
              new Error(postRegistraBeneficiarioResult.value.value.status)
            )
          )
        );
        return;
      }

      yield* put(
        cdcEnrollUserToBonus.failure(
          getGenericError(
            new Error(postRegistraBeneficiarioResult.value.status.toString())
          )
        )
      );
      return;
    }
    yield* put(
      cdcEnrollUserToBonus.failure(
        getGenericError(
          new Error("Invalid payload from postRegistraBeneficiario")
        )
      )
    );
  } catch (e) {
    yield* put(cdcEnrollUserToBonus.failure(getNetworkError(e)));
  }
}

export const testableFunctions = isTestEnv
  ? {
      convertSuccess,
      convertRequestPayload
    }
  : {};
