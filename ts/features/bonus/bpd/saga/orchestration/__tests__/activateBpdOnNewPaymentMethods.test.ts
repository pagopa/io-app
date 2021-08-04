import { left, right } from "fp-ts/lib/Either";
import { createStore } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { BpdConfig } from "../../../../../../../definitions/content/BpdConfig";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { appReducer } from "../../../../../../store/reducers";
import { bpdRemoteConfigSelector } from "../../../../../../store/reducers/backendStatus";
import { mockPrivativeCard } from "../../../../../../store/reducers/wallet/__mocks__/wallets";
import { EnableableFunctionsTypeEnum } from "../../../../../../types/pagopa";
import { navigateToSuggestBpdActivation } from "../../../../../wallet/onboarding/bancomat/navigation/action";
import { navigateToActivateBpdOnNewPrivative } from "../../../../../wallet/onboarding/privative/navigation/action";
import { activateBpdOnNewPaymentMethods } from "../activateBpdOnNewAddedPaymentMethods";
import { isBpdEnabled } from "../onboarding/startOnboarding";

const enrollAfterAddTrue: BpdConfig = {
  enroll_bpd_after_add_payment_method: true,
  program_active: true
};

const enrollAfterAddFalse: BpdConfig = {
  enroll_bpd_after_add_payment_method: false,
  program_active: true
};

describe("Test activateBpdOnNewPaymentMethods behaviour", () => {
  jest.useFakeTimers();
  it("With default state and no payment methods, should navigate to wallet home", async () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [],
      navigateToActivateBpdOnNewPrivative()
    )
      .withState(store.getState())
      .put(navigateToWalletHome())
      .not.call(isBpdEnabled)
      .not.select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With at least one payment method with bpd capability and an error to retrieve the bpd enrolling, should navigate to wallet home", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), left(new Error("An error"))],
        [matchers.select(bpdRemoteConfigSelector), enrollAfterAddFalse]
      ])
      .call(isBpdEnabled)
      .put(navigateToWalletHome())
      .select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With all payment methods without bpd capability, should navigate to navigateToWalletHome", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [
        {
          ...mockPrivativeCard,
          enableableFunctions: [
            EnableableFunctionsTypeEnum.FA,
            EnableableFunctionsTypeEnum.pagoPA
          ]
        }
      ],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(true)],
        [matchers.select(bpdRemoteConfigSelector), enrollAfterAddFalse]
      ])
      .put(navigateToWalletHome())
      .not.call(isBpdEnabled)
      .not.select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With at least one payment method with bpd capability, bpd enrolled and program_active === true, should navigate to navigateToActivateBpdOnNewPrivative", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(true)],
        [matchers.select(bpdRemoteConfigSelector), enrollAfterAddFalse]
      ])
      .not.put(navigateToWalletHome())
      .call(isBpdEnabled)
      .select(bpdRemoteConfigSelector)
      .put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With at least one payment method with bpd capability, bpd enrolled and program_active === false, should navigate to navigateToActivateBpdOnNewPrivative", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(true)],
        [
          matchers.select(bpdRemoteConfigSelector),
          { ...enrollAfterAddFalse, program_active: false }
        ]
      ])
      .not.put(navigateToWalletHome())
      .call(isBpdEnabled)
      .select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With at least one payment method with bpd capability, bpd not enrolled and remote configuration false or undefined should navigate to navigateToWalletHome", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(false)],
        [matchers.select(bpdRemoteConfigSelector), enrollAfterAddFalse]
      ])
      .call(isBpdEnabled)
      .select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();

    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(false)],
        [matchers.select(bpdRemoteConfigSelector), undefined]
      ])
      .call(isBpdEnabled)
      .select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .not.put(navigateToSuggestBpdActivation())
      .run();
  });

  it("With at least one payment method with bpd capability, bpd not enrolled and remote configuration true, should navigate to navigateToWalletHome", async () => {
    await expectSaga(
      activateBpdOnNewPaymentMethods,
      [mockPrivativeCard],
      navigateToActivateBpdOnNewPrivative()
    )
      .provide([
        [matchers.call(isBpdEnabled), right(false)],
        [matchers.select(bpdRemoteConfigSelector), enrollAfterAddTrue]
      ])
      .call(isBpdEnabled)
      .select(bpdRemoteConfigSelector)
      .not.put(navigateToActivateBpdOnNewPrivative())
      .put(navigateToSuggestBpdActivation())
      .run();
  });
});
