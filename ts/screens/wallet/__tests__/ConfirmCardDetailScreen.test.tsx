import { none } from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { CreditCard, TransactionResponse } from "../../../types/pagopa";
import { CreditCardPan } from "../../../utils/input";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ConfirmCardDetailsScreen, {
  NavigationParams
} from "../ConfirmCardDetailsScreen";
import { payCreditCardVerificationSuccess } from "../../../store/actions/wallet/wallets";

jest.unmock("react-navigation");
jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("ConfirmCardDetailScreen", () => {
  beforeEach(() => jest.useFakeTimers());

  const params: NavigationParams = {
    creditCard: {
      pan: "123456789" as CreditCardPan,
      holder: "tester"
    } as CreditCard,
    inPayment: none
  } as NavigationParams;

  it("should show the loading modal if creditCardVerification is some and creditCardCheckout3ds is not pot.some", () => {
    const ToBeTested: React.FunctionComponent<React.ComponentProps<
      typeof ConfirmCardDetailsScreen
    >> = (props: React.ComponentProps<typeof ConfirmCardDetailsScreen>) => (
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

    store.dispatch(payCreditCardVerificationSuccess({} as TransactionResponse));

    const loadingModal = component.getAllByTestId("overlayComponent");
    const loadingText = component.getByText(
      I18n.t("wallet.saveCard.loadingAlert")
    );

    expect(loadingModal).not.toBeNull();
    expect(loadingText).not.toBeEmpty();
  });
});
