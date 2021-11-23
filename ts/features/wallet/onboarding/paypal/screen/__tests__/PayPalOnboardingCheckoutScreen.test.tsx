import { createStore, Store } from "redux";
import { NavigationParams } from "react-navigation";
import { appReducer } from "../../../../../../store/reducers";
import { setLocale } from "../../../../../../i18n";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalOnboardingCheckoutScreen from "../PayPalOnboardingCheckoutScreen";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  walletAddPaypalPspSelected,
  walletAddPaypalRefreshPMToken
} from "../../store/actions";
import PAYPAL_ROUTES from "../../navigation/routes";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { pspList } from "../__mocks__/psp";

describe("PayPalOnboardingCheckoutScreen", () => {
  beforeAll(() => {
    setLocale("it");
  });
  jest.useFakeTimers();

  it(`screen should be defined`, () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const render = renderComponent(store);
    expect(render.component).not.toBeNull();
  });

  describe("when the PM token is not in the store", () => {
    it(`it should show the loading`, () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      const render = renderComponent(store);
      expect(
        render.component.queryByTestId(
          "PayPalOnboardingCheckoutScreenLoadingError"
        )
      ).not.toBeNull();
    });
  });

  describe("when the PM token is requested and the response is a failure", () => {
    it(`it should show the error component with the retry button`, () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      const render = renderComponent(store);
      expect(
        render.component.queryByTestId(
          "PayPalOnboardingCheckoutScreenLoadingError"
        )
      ).not.toBeNull();
      store.dispatch(walletAddPaypalRefreshPMToken.failure(Error("an error")));
      expect(
        render.component.queryByTestId("LoadingErrorComponentError")
      ).not.toBeNull();
    });
  });

  describe("when the PM token is requested and the response is a success", () => {
    it(`it should show a generic error since the pspSelected is none`, () => {
      const globalState = appReducer(
        undefined,
        walletAddPaypalRefreshPMToken.request()
      );
      const store = createStore(appReducer, globalState as any);
      const render = renderComponent(store);
      expect(
        render.component.queryByTestId(
          "PayPalOnboardingCheckoutScreenLoadingError"
        )
      ).not.toBeNull();
      store.dispatch(
        walletAddPaypalRefreshPMToken.success("a token" as PaymentManagerToken)
      );
      expect(
        render.component.queryByTestId("WorkunitGenericFailure")
      ).not.toBeNull();
    });
  });

  describe("when the PM token is requested and the response is a success and the there is a psp selected", () => {
    it(`it should show the checkout web view`, () => {
      const globalState = appReducer(
        undefined,
        walletAddPaypalRefreshPMToken.request()
      );
      const store = createStore(appReducer, globalState as any);
      const render = renderComponent(store);
      expect(
        render.component.queryByTestId(
          "PayPalOnboardingCheckoutScreenLoadingError"
        )
      ).not.toBeNull();
      store.dispatch(
        walletAddPaypalRefreshPMToken.success("a token" as PaymentManagerToken)
      );
      store.dispatch(walletAddPaypalPspSelected(pspList[0]));
      expect(
        render.component.queryByTestId("PayWebViewModalTestID")
      ).not.toBeNull();
    });
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    PayPalOnboardingCheckoutScreen,
    PAYPAL_ROUTES.ONBOARDING.CHECKOUT,
    {},
    store
  ),
  store
});
