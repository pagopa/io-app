import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { IDPayClient } from "../../../common/api/client";
import {
  idPayOnboardingStatusGet,
  IdPayOnboardingStatusGetPayloadType
} from "../store/actions";

/**
 * Handle the remote call to retrieve the IDPay initiative details
 * @param getInitiativeDetails
 * @param action
 * @param initiativeId
 */

export function* handleGetOnboardingStatus(
  onboardingStatus: IDPayClient["onboardingStatus"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayOnboardingStatusGetPayloadType
) {
  try {
    const onboardingStatusResult: SagaCallReturnType<typeof onboardingStatus> =
      yield* call(onboardingStatus, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId
      });
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
