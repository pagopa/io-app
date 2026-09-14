import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok, Result } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

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

    const result = (
      "isOk" in idPayEnrollCodeResult
        ? idPayEnrollCodeResult
        : "right" in idPayEnrollCodeResult
          ? ok(idPayEnrollCodeResult.right)
          : err(idPayEnrollCodeResult.left)
    ) as Result<
      Extract<
        SagaCallReturnType<typeof enrollInstrumentCode>,
        { right: unknown }
      >["right"],
      unknown
    >;

    yield result.match(
      response =>
        put(
          response.status === 200
            ? idPayEnrollCode.success()
            : idPayEnrollCode.failure({
                ...getGenericError(
                  new Error(`response status code ${response.status}`)
                )
              })
        ),
      error =>
        put(
          idPayEnrollCode.failure({
            ...getGenericError(
              new Error(
                readablePrivacyReport(
                  error as Parameters<typeof readablePrivacyReport>[0]
                )
              )
            )
          })
        )
    );
  } catch (e) {
    yield* put(idPayEnrollCode.failure({ ...getNetworkError(e) }));
  }
}
