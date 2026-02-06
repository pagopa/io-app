import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayOnboardingStatusGet } from "../store/actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";

/**
 * Handle the remote call to retrieve the IDPay initiative onboarding status
 * @param onboardingStatus
 * @param action
 * @param initiativeId
 */
export function* handleGetOnboardingStatus(
  onboardingStatus: IDPayClient["onboardingStatus"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayOnboardingStatusGet)["request"]>
) {
  const onboardingStatusRequest = onboardingStatus({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const onboardingStatusResult = (yield* call(
      withRefreshApiCall,
      onboardingStatusRequest,
      action
    )) as unknown as SagaCallReturnType<typeof onboardingStatus>;

    yield pipe(
      onboardingStatusResult,
      E.fold(
        error =>
          put(
            idPayOnboardingStatusGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayOnboardingStatusGet.success(response.value)
              : idPayOnboardingStatusGet.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayOnboardingStatusGet.failure({ ...getNetworkError(e) }));
  }
}
