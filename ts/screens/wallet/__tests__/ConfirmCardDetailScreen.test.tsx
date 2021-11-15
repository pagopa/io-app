import { none } from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { CreditCard, NullableWallet } from "../../../types/pagopa";
import { CreditCardPan } from "../../../utils/input";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ConfirmCardDetailsScreen, {
  NavigationParams
} from "../ConfirmCardDetailsScreen";
import {
  addWalletCreditCardWithBackoffRetryRequest,
  fetchWalletsRequest
} from "../../../store/actions/wallet/wallets";

jest.unmock("react-navigation");
jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("ConfirmCardDetailScreen", () => {
  beforeEach(() => jest.useFakeTimers());

  it("should show the loading modal if creditCardAddWallet is pot.loading", () => {
    const { component, store } = getComponent();

    store.dispatch(
      addWalletCreditCardWithBackoffRetryRequest({
        creditcard: {} as NullableWallet
      })
    );

    const loadingModal = component.getAllByTestId("overlayComponent");
    const loadingText = component.getByText(
      I18n.t("wallet.saveCard.loadingAlert")
    );

    expect(loadingModal).not.toBeNull();
    expect(loadingText).not.toBeEmpty();
  });

  it("should show the loading modal if walletById is pot.loading", () => {
    const { component, store } = getComponent();

    store.dispatch(fetchWalletsRequest());

    const loadingModal = component.getAllByTestId("overlayComponent");
    const loadingText = component.getByText(
      I18n.t("wallet.saveCard.loadingAlert")
    );

    expect(loadingModal).not.toBeNull();
    expect(loadingText).not.toBeEmpty();
  });
});

const getComponent = () => {
  const params: NavigationParams = {
    creditCard: {
      pan: "123456789" as CreditCardPan,
      holder: "tester"
    } as CreditCard,
    inPayment: none
  } as NavigationParams;
  const ToBeTested: React.FunctionComponent<
    React.ComponentProps<typeof ConfirmCardDetailsScreen>
  > = (props: React.ComponentProps<typeof ConfirmCardDetailsScreen>) => (
    <ConfirmCardDetailsScreen {...props} />
  );

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ToBeTested,
    ROUTES.WALLET_ADD_CARD,
    params,
    store
  );

  return { component, store };
};
