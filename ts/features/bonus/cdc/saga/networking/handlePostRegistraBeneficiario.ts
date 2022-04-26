import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendCdcClient } from "../../api/backendCdc";
import { cdcEnrollUserToBonus } from "../../store/actions/cdcBonusRequest";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { AnniRiferimento } from "../../../../../../definitions/cdc/AnniRiferimento";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import { CdcBonusEnrollmentOutcomeList } from "../../types/CdcBonusRequest";

const convertSuccess = (
  listaEsitoRichiestaPerAnno: ListaEsitoRichiestaPerAnno
): CdcBonusEnrollmentOutcomeList =>
  listaEsitoRichiestaPerAnno.listaEsitoRichiestaPerAnno.map(o => ({
    year: o.annoRiferimento,
    outcome: o.statoBeneficiario
  }));

export function* handlePostRegistraBeneficiario(
  postRegistraBeneficiario: BackendCdcClient["postRegistraBeneficiario"],
  action: ActionType<typeof cdcEnrollUserToBonus.request>
) {
  const requestPayload: { anniRiferimento: AnniRiferimento } = {
    anniRiferimento: {
      anniRif: action.payload.map(y => ({
        anno: y.year
      }))
    }
  };

  try {
    const postRegistraBeneficiarioResult = yield* call(
      postRegistraBeneficiario,
      requestPayload
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
        cdcEnrollUserToBonus.failure(
          getGenericError(
            new Error(postRegistraBeneficiarioResult.value.value.status)
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
    cdcEnrollUserToBonus.failure(
      getGenericError(new Error("Invalid payload from getStatoBeneficiario"))
    );
  } catch (e) {
    yield* put(cdcEnrollUserToBonus.failure(getNetworkError(e)));
  }
}
