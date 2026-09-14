import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

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

    yield (
      "isOk" in getInitiativeBeneficiaryResult
        ? getInitiativeBeneficiaryResult
        : "right" in getInitiativeBeneficiaryResult
          ? ok(getInitiativeBeneficiaryResult.right)
          : err(getInitiativeBeneficiaryResult.left)
    ).match(
      response =>
        put(
          response.status === 200
            ? idPayBeneficiaryDetailsGet.success(response.value)
            : idPayBeneficiaryDetailsGet.failure({
                ...getGenericError(
                  new Error(`response status code ${response.status}`)
                )
              })
        ),
      error =>
        put(
          idPayBeneficiaryDetailsGet.failure({
            ...getGenericError(new Error(readablePrivacyReport(error)))
          })
        )
    );
  } catch (e) {
    yield* put(idPayBeneficiaryDetailsGet.failure({ ...getNetworkError(e) }));
  }
}
