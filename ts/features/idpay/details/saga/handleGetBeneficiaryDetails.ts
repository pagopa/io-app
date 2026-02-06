import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayClient } from "../../common/api/client";
import { idPayBeneficiaryDetailsGet } from "../store/actions";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to retrieve the IDPay initiative beneficiary details
 * @param getInitiativeBeneficiaryDetail BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetBeneficiaryDetails(
  getInitiativeBeneficiaryDetail: IDPayClient["getInitiativeBeneficiaryDetail"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayBeneficiaryDetailsGet)["request"]>
) {
  const getInitiativeBeneficiaryRequest = getInitiativeBeneficiaryDetail({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const getInitiativeBeneficiaryResult = (yield* call(
      withRefreshApiCall,
      getInitiativeBeneficiaryRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getInitiativeBeneficiaryDetail>;

    yield pipe(
      getInitiativeBeneficiaryResult,
      E.fold(
        error =>
          put(
            idPayBeneficiaryDetailsGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayBeneficiaryDetailsGet.success(response.value)
              : idPayBeneficiaryDetailsGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayBeneficiaryDetailsGet.failure({ ...getNetworkError(e) }));
  }
}
