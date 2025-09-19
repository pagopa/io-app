import * as E from "fp-ts/lib/Either";

import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../definitions/backend/PreferredLanguage";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { IDPayClient } from "../../common/api/client";
import { idPayInitiativeWaitingListGet } from "../store/actions";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";

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

    yield* put(
      pipe(
        getOnboardingInitiativeWaitingListResult,
        E.fold(
          error =>
            idPayInitiativeWaitingListGet.failure({
              ...getGenericError(new Error(readablePrivacyReport(error)))
            }),

          res => {
            if (res.status === 200) {
              return idPayInitiativeWaitingListGet.success(res.value);
            }
            return idPayInitiativeWaitingListGet.failure({
              ...getGenericError(new Error(`Error: ${res.status}`))
            });
          }
        )
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
