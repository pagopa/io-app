import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/identity/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayEnrollCode } from "../store/actions";

export function* handleIdPayEnrollCode(
  enrollInstrumentCode: IDPayClient["enrollInstrumentCode"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayEnrollCode)["request"]>
) {
  const idPayGenerateCodeRequest = enrollInstrumentCode({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const idPayEnrollCodeResult = (yield* call(
      withRefreshApiCall,
      idPayGenerateCodeRequest,
      action
    )) as unknown as SagaCallReturnType<typeof enrollInstrumentCode>;

    yield pipe(
      idPayEnrollCodeResult,
      E.fold(
        error =>
          put(
            idPayEnrollCode.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayEnrollCode.success()
              : idPayEnrollCode.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayEnrollCode.failure({ ...getNetworkError(e) }));
  }
}
