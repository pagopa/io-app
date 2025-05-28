import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idpayInitiativeGet } from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getInitiativeDetails BE API call
 * @param bpdToken Auth token
 * @param language Preferred language
 * @param action Action to handle
 */
export function* handleGetInitiativeDetails(
  getInitiativeDetails: IDPayClient["getWalletDetail"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idpayInitiativeGet)["request"]>
) {
  const getInitiativeDetailsRequest = getInitiativeDetails({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const getInitiativeDetailsResult = (yield* call(
      withRefreshApiCall,
      getInitiativeDetailsRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getInitiativeDetails>;

    yield pipe(
      getInitiativeDetailsResult,
      E.fold(
        error =>
          put(
            idpayInitiativeGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idpayInitiativeGet.success(response.value)
              : idpayInitiativeGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idpayInitiativeGet.failure({ ...getNetworkError(e) }));
  }
}
