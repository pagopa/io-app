import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok, Result } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { walletRemoveCards } from "../../../wallet/store/actions/cards";
import { IDPayClient } from "../../common/api/client";
import { idPayUnsubscribeAction } from "../store/actions";

export function* handleUnsubscribe(
  unsubscribe: IDPayClient["unsubscribe"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayUnsubscribeAction)["request"]>
) {
  const unsubscribeRequest = unsubscribe({
    bearerAuth: bearerToken,
    "Accept-Language": language,
    initiativeId: action.payload.initiativeId
  });

  try {
    const getTimelineResult = (yield* call(
      withRefreshApiCall,
      unsubscribeRequest,
      action
    )) as unknown as SagaCallReturnType<typeof unsubscribe>;

    const result = (
      "isOk" in getTimelineResult
        ? getTimelineResult
        : "right" in getTimelineResult
          ? ok(getTimelineResult.right)
          : err(getTimelineResult.left)
    ) as Result<
      Extract<
        SagaCallReturnType<typeof unsubscribe>,
        { right: unknown }
      >["right"],
      unknown
    >;

    yield* result.match(
      response => {
        if (response.status === 204) {
          return [
            put(walletRemoveCards([`idpay_${action.payload.initiativeId}`])),
            put(idPayUnsubscribeAction.success())
          ];
        }
        return put(
          idPayUnsubscribeAction.failure({
            ...getGenericError(
              new Error(`response status code ${response.status}`)
            )
          })
        );
      },
      error =>
        put(
          idPayUnsubscribeAction.failure({
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
    yield* put(idPayUnsubscribeAction.failure({ ...getNetworkError(e) }));
  }
}
