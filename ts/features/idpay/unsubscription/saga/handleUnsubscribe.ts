import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayClient } from "../../common/api/client";
import {
  idPayUnsubscribe,
  IdPayUnsubscribePayloadType
} from "../store/actions";

export function* handleUnsubscribe(
  unsubscribe: IDPayClient["unsubscribe"],
  token: string,
  language: PreferredLanguageEnum,
  payload: IdPayUnsubscribePayloadType
) {
  try {
    const unsubscribeResult: SagaCallReturnType<typeof unsubscribe> =
      yield* call(unsubscribe, {
        bearerAuth: token,
        "Accept-Language": language,
        initiativeId: payload.initiativeId
      });
    yield pipe(
      unsubscribeResult,
      E.fold(
        error =>
          put(
            idPayUnsubscribe.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            })
          ),
        response =>
          put(
            response.status === 200
              ? idPayUnsubscribe.success(response.value)
              : idPayUnsubscribe.failure({
                  ...getGenericError(
                    new Error(`response status code ${response.status}`)
                  )
                })
          )
      )
    );
  } catch (e) {
    yield* put(idPayUnsubscribe.failure({ ...getNetworkError(e) }));
  }
}
