import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { PreferredLanguageEnum } from "../../../../../../definitions/backend/PreferredLanguage";
import {
  OnboardingStatusDTO,
  StatusEnum as OnboardingStatusEnum
} from "../../../../../../definitions/idpay/OnboardingStatusDTO";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { idPayOnboardingStatusGet } from "../../store/actions";
import { handleGetOnboardingStatus } from "../handleGetOnboardingStatus";

describe("idPayOnboardingStatusGet", () => {
  const initiativeId = "abcdef";

  const onboardingStatusData: OnboardingStatusDTO = {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: new Date(2023, 1, 1)
  };

  describe("when the response is successful", () => {
    it(`should put ${getType(
      idPayOnboardingStatusGet.success
    )} with the onboarding status details`, () => {
      const onboardingStatus = jest.fn();
      testSaga(
        handleGetOnboardingStatus,
        onboardingStatus,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayOnboardingStatusGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          onboardingStatus({
            initiativeId
          }),
          idPayOnboardingStatusGet.request({ initiativeId })
        )
        .next(E.right({ status: 200, value: onboardingStatusData }))
        .put(idPayOnboardingStatusGet.success(onboardingStatusData))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      idPayOnboardingStatusGet.failure
    )} with the error`, () => {
      const onboardingStatus = jest.fn();
      testSaga(
        handleGetOnboardingStatus,
        onboardingStatus,
        "bpdToken",
        PreferredLanguageEnum.it_IT,
        idPayOnboardingStatusGet.request({ initiativeId })
      )
        .next()
        .call(
          withRefreshApiCall,
          onboardingStatus({
            initiativeId
          }),
          idPayOnboardingStatusGet.request({ initiativeId })
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          idPayOnboardingStatusGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
