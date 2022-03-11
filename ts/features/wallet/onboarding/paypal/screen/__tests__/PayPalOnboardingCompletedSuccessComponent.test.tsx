import { createStore } from "redux";

import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalOnboardingCompletedSuccessComponent from "../PayPalOnboardingCompletedSuccessComponent";
import I18n, { setLocale } from "../../../../../../i18n";
import { walletAddPaypalStart } from "../../store/actions";

describe("PayPalOnboardingCompletedSuccessComponent", () => {
  beforeAll(() => {
    setLocale("it");
  });
  jest.useFakeTimers();

  it(`should match the snapshot`, () => {
    const { render } = renderComponent();
    expect(render.component.toJSON()).toMatchSnapshot();
  });

  it(`screen should be defined`, () => {
    const { render } = renderComponent();
    expect(
      render.component.queryByTestId("InfoScreenComponent")
    ).not.toBeNull();
  });

  it(`buttons should be defined`, () => {
    const { render } = renderComponent();
    expect(render.component.queryByTestId("primaryButtonId")).not.toBeNull();
  });

  describe("when paypal is onboarded from the wallet section", () => {
    it(`then the texts shown should match the dedicated messages`, () => {
      const { render, store } = renderComponent();
      store.dispatch(walletAddPaypalStart("payment_method_details"));
      expect(
        render.component.queryByText(
          I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")
        )
      ).not.toBeNull();
      expect(
        render.component.queryByText(
          I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")
        )
      ).not.toBeNull();
      expect(
        render.component.queryByText(
          I18n.t("wallet.onboarding.paypal.onBoardingCompleted.primaryButton")
        )
      ).not.toBeNull();
    });
  });

  describe("when paypal is onboarded during a payment", () => {
    it(`then the texts shown should match the dedicated messages`, () => {
      const { render, store } = renderComponent();
      store.dispatch(walletAddPaypalStart("back"));
      expect(
        render.component.queryByText(
          I18n.t(
            "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.title"
          )
        )
      ).not.toBeNull();
      expect(
        render.component.queryByText(
          I18n.t(
            "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.body"
          )
        )
      ).not.toBeNull();
      expect(
        render.component.queryByText(
          I18n.t(
            "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.primaryButton"
          )
        )
      ).not.toBeNull();
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const render = {
    component: renderScreenFakeNavRedux<GlobalState>(
      PayPalOnboardingCompletedSuccessComponent,
      "N/A",
      {},
      store
    ),
    store
  };
  return { render, store };
};
