import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { EsitoRichiestaEnum } from "../../../../../../definitions/cdc/EsitoRichiesta";
import { ListaEsitoRichiestaPerAnno } from "../../../../../../definitions/cdc/ListaEsitoRichiestaPerAnno";
import { isTestEnv } from "../../../../../utils/environment";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { BackendCdcClient } from "../../api/backendCdc";
import { cdcEnrollUserToBonus } from "../../store/actions/cdcBonusRequest";
import {
  CdcBonusEnrollmentList,
  CdcBonusEnrollmentOutcomeList,
  CdcBonusRequestResponse,
  CdcBonusRequestResponseFailure,
  CdcBonusRequestResponseSuccess,
  CdcSelectedBonus,
  RequestOutcomeEnum
} from "../../types/CdcBonusRequest";

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

const convertRequestPayload = (actionPayload: CdcBonusEnrollmentList) => ({
  body: {
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

    if (E.isRight(postRegistraBeneficiarioResult)) {
      if (postRegistraBeneficiarioResult.right.status === 200) {
        yield* put(
          cdcEnrollUserToBonus.success(
            convertSuccess(
              postRegistraBeneficiarioResult.right.value,
              bonusWithoutRequirements
            )
          )
        );
        return;
      }
      if (mapKinds[postRegistraBeneficiarioResult.right.status] !== undefined) {
        yield* put(
          cdcEnrollUserToBonus.success({
            kind: mapKinds[postRegistraBeneficiarioResult.right.status],
            reason: postRegistraBeneficiarioResult.right.value?.status
          })
        );
        return;
      }

      yield* put(
        cdcEnrollUserToBonus.failure(
          getGenericError(
            new Error(postRegistraBeneficiarioResult.right.status.toString())
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
