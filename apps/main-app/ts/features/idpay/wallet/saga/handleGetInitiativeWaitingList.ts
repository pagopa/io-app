import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { err, ok, Result } from "neverthrow";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { IDPayClient } from "../../common/api/client";
import { idPayInitiativeWaitingListGet } from "../store/actions";

export function* handleGetInitiativeWaitingList(
  getOnboardingInitiativeWaitingList: IDPayClient["onboardingInitiativeUserStatus"],
  bearerToken: string,
  language: PreferredLanguageEnum,
  action: ActionType<(typeof idPayInitiativeWaitingListGet)["request"]>
) {
  const getOnboardingInitiativeWaitingListRequest =
    getOnboardingInitiativeWaitingList({
      bearerAuth: bearerToken,
      "Accept-Language": language
    });

  try {
    const getOnboardingInitiativeWaitingListResult = (yield* call(
      withRefreshApiCall,
      getOnboardingInitiativeWaitingListRequest,
      action
    )) as unknown as SagaCallReturnType<
      typeof getOnboardingInitiativeWaitingList
    >;

    const result = (
      "isOk" in getOnboardingInitiativeWaitingListResult
        ? getOnboardingInitiativeWaitingListResult
        : "right" in getOnboardingInitiativeWaitingListResult
          ? ok(getOnboardingInitiativeWaitingListResult.right)
          : err(getOnboardingInitiativeWaitingListResult.left)
    ) as Result<
      Extract<
        SagaCallReturnType<typeof getOnboardingInitiativeWaitingList>,
        { right: unknown }
      >["right"],
      unknown
    >;

    yield* put(
      result.match(
        res => {
          if (res.status === 200) {
            return idPayInitiativeWaitingListGet.success(res.value);
          }
          return idPayInitiativeWaitingListGet.failure({
            ...getGenericError(new Error(`Error: ${res.status}`))
          });
        },
        error =>
          idPayInitiativeWaitingListGet.failure({
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
    yield* put(
      idPayInitiativeWaitingListGet.failure({
        ...getNetworkError(e)
      })
    );
  }
}
