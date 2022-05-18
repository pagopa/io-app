import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendCdcClient } from "../../api/backendCdc";
import { cdcEnrollUserToBonus } from "../../store/actions/cdcBonusRequest";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { AnniRiferimento } from "../../../../../../definitions/cdc/AnniRiferimento";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import {
  CdcBonusEnrollmentList,
  CdcBonusEnrollmentOutcomeList,
  CdcBonusRequestResponse,
  CdcBonusRequestResponseFailure,
  CdcBonusRequestResponseSuccess,
  CdcSelectedBonus,
  RequestOutcomeEnum
} from "../../types/CdcBonusRequest";
import { isTestEnv } from "../../../../../utils/environment";
import { EsitoRichiestaEnum } from "../../../../../../definitions/cdc/EsitoRichiesta";

const mapKinds: Record<number, CdcBonusRequestResponseFailure["kind"]> = {
  400: "wrongFormat"
};

const convertSuccess = (
  listaEsitoRichiestaPerAnno: ListaEsitoRichiestaPerAnno,
  bonusWithoutRequirements: ReadonlyArray<CdcSelectedBonus>
): CdcBonusRequestResponse => {
  const bonusWithoutRequirementsOutcome: CdcBonusEnrollmentOutcomeList =
    bonusWithoutRequirements.map(b => ({
      year: b.year,
      outcome: RequestOutcomeEnum.RESIDENCE_ABROAD
    }));

  const kind: CdcBonusRequestResponseSuccess["kind"] =
    listaEsitoRichiestaPerAnno.listaEsitoRichiestaPerAnno.some(
      o => o.esitoRichiesta !== EsitoRichiestaEnum.OK
    ) || bonusWithoutRequirementsOutcome.length > 0
      ? "partialSuccess"
      : "success";

  const convertedResponse =
    listaEsitoRichiestaPerAnno.listaEsitoRichiestaPerAnno.map(o => ({
      year: o.annoRiferimento,
      outcome: o.esitoRichiesta
    }));

  return convertedResponse.every(b => b.outcome !== RequestOutcomeEnum.OK)
    ? { kind: "genericError" }
    : {
        kind,
        value: [...convertedResponse, ...bonusWithoutRequirementsOutcome]
      };
};

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
  const requestedBonus = action.payload;

  const bonusWithRequirements = requestedBonus.filter(
    b => b.residence === "italy"
  );
  const bonusWithoutRequirements = requestedBonus.filter(
    b => b.residence === "notItaly"
  );

  if (bonusWithoutRequirements.length === requestedBonus.length) {
    yield* put(cdcEnrollUserToBonus.success({ kind: "requirementsError" }));
    return;
  }

  try {
    const postRegistraBeneficiarioResult = yield* call(
      postRegistraBeneficiario,
      convertRequestPayload(bonusWithRequirements)
    );

    if (postRegistraBeneficiarioResult.isRight()) {
      if (postRegistraBeneficiarioResult.value.status === 200) {
        yield* put(
          cdcEnrollUserToBonus.success(
            convertSuccess(
              postRegistraBeneficiarioResult.value.value,
              bonusWithoutRequirements
            )
          )
        );
        return;
      }
      if (mapKinds[postRegistraBeneficiarioResult.value.status] !== undefined) {
        yield* put(
          cdcEnrollUserToBonus.success({
            kind: mapKinds[postRegistraBeneficiarioResult.value.status],
            reason: postRegistraBeneficiarioResult.value.value?.status
          })
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
