import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ListaStatoPerAnno } from "../../../../../../definitions/cdc/ListaStatoPerAnno";
import { isTestEnv } from "../../../../../utils/environment";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { BackendCdcClient } from "../../api/backendCdc";
import { cdcRequestBonusList } from "../../store/actions/cdcBonusRequest";
import { CdcBonusRequestList } from "../../types/CdcBonusRequest";

// convert a success response to the logical app representation of it
const convertSuccess = (listaPerAnno: ListaStatoPerAnno): CdcBonusRequestList =>
  listaPerAnno.listaStatoPerAnno.map(statusPerYear => ({
    status: statusPerYear.statoBeneficiario,
    year: statusPerYear.annoRiferimento
  }));

/**
 * Return the state of the user for each year in which the bonus is available
 * @param getStatoBeneficiario
 * @param _
 */
export function* handleGetStatoBeneficiario(
  getStatoBeneficiario: BackendCdcClient["getStatoBeneficiario"],
  _: ActionType<typeof cdcRequestBonusList.request>
) {
  try {
    const getStatoBeneficiarioResult = yield* call(getStatoBeneficiario, {});

    if (E.isRight(getStatoBeneficiarioResult)) {
      if (getStatoBeneficiarioResult.right.status === 200) {
        yield* put(
          cdcRequestBonusList.success(
            convertSuccess(getStatoBeneficiarioResult.right.value)
          )
        );
        return;
      }
      yield* put(
        cdcRequestBonusList.failure(
          getGenericError(
            new Error(getStatoBeneficiarioResult.right.status.toString())
          )
        )
      );
      return;
    }
    yield* put(
      cdcRequestBonusList.failure(
        getGenericError(new Error("Invalid payload from getStatoBeneficiario"))
      )
    );
  } catch (e) {
    yield* put(cdcRequestBonusList.failure(getNetworkError(e)));
  }
}

export const testableFunctions = isTestEnv
  ? {
      convertSuccess
    }
  : {};
