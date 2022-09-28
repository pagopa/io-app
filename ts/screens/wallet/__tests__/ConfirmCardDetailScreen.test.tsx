import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import {
  addWalletCreditCardWithBackoffRetryRequest,
  fetchWalletsRequest
} from "../../../store/actions/wallet/wallets";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { CreditCard, NullableWallet } from "../../../types/pagopa";
import { CreditCardPan } from "../../../utils/input";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import ConfirmCardDetailsScreen, {
  ConfirmCardDetailsScreenNavigationParams
} from "../ConfirmCardDetailsScreen";

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
  const params: ConfirmCardDetailsScreenNavigationParams = {
    creditCard: {
      pan: "123456789" as CreditCardPan,
      holder: "tester"
    } as CreditCard,
    inPayment: O.none
  } as ConfirmCardDetailsScreenNavigationParams;
  const ToBeTested: React.FunctionComponent<
    React.ComponentProps<typeof ConfirmCardDetailsScreen>
  > = (props: React.ComponentProps<typeof ConfirmCardDetailsScreen>) => (
    <ConfirmCardDetailsScreen {...props} />
  );

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    ToBeTested,
    ROUTES.WALLET_ADD_CARD,
    params,
    store
  );

  return { component, store };
};
