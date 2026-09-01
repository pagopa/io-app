import { CommonActions } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";

import { isFastLoginEnabledSelector } from "../../../features/authentication/fastLogin/store/selectors";
import { createPinSuccess } from "../../../features/settings/security/store/actions/pinset";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { navigateToOnboardingPinScreenAction } from "../../../store/actions/navigation";
import { PinString } from "../../../types/PinString";
import { getPin } from "../../../utils/keychain";
import { checkConfiguredPinSaga } from "../checkConfiguredPinSaga";

const validPin = "123456" as PinString;
const validPolicyPin = "246813" as PinString;
const invalidPin = "12" as PinString;

describe("checkConfiguredPinSaga", () => {
  it("should return the pin when it is present and fast login is disabled", () => {
    testSaga(checkConfiguredPinSaga)
      .next()
      .call(getPin)
      .next(O.some(validPin))
      .select(isFastLoginEnabledSelector)
      .next(false)
      .returns(validPin);
  });

  it("should return the pin when it is present, fast login is enabled and the pin is valid", () => {
    testSaga(checkConfiguredPinSaga)
      .next()
      .call(getPin)
      .next(O.some(validPolicyPin))
      .select(isFastLoginEnabledSelector)
      .next(true)
      .returns(validPolicyPin);
  });

  it("should go through the onboarding pin flow when fast login is enabled and the stored pin is not valid", () => {
    const resultAction = createPinSuccess(validPin);

    testSaga(checkConfiguredPinSaga)
      .next()
      .call(getPin)
      .next(O.some(invalidPin))
      .select(isFastLoginEnabledSelector)
      .next(true)
      .call(navigateToOnboardingPinScreenAction)
      .next()
      .take(createPinSuccess)
      .next(resultAction)
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate({
          name: ROUTES.MAIN,
          merge: true
        })
      )
      .next()
      .returns(validPin);
  });

  it("should go through the onboarding pin flow when no pin is stored", () => {
    const resultAction = createPinSuccess(validPin);

    testSaga(checkConfiguredPinSaga)
      .next()
      .call(getPin)
      .next(O.none)
      .call(navigateToOnboardingPinScreenAction)
      .next()
      .take(createPinSuccess)
      .next(resultAction)
      .call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate({
          name: ROUTES.MAIN,
          merge: true
        })
      )
      .next()
      .returns(validPin);
  });
});
