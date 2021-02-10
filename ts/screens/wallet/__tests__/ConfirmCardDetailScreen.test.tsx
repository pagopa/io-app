import { none } from "fp-ts/lib/Option";
import { pot } from "italia-ts-commons";
import * as React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { CreditCard } from "../../../types/pagopa";
import { CreditCardPan } from "../../../utils/input";
// import { reproduceSequence } from "../../../utils/tests";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import ConfirmCardDetailsScreen, {
  NavigationParams
} from "../ConfirmCardDetailsScreen";

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

  it("should show the loading modal if creditCardVerification is some and creditCardCheckout3ds is someLoading", () => {
    const ToBeTested: React.FunctionComponent<React.ComponentProps<
      typeof ConfirmCardDetailsScreen
    >> = (props: React.ComponentProps<typeof ConfirmCardDetailsScreen>) => (
      <ConfirmCardDetailsScreen {...props} />
    );

    // const sequenceOfActions: ReadonlyArray<Action> = [
    //   creditCardCheckout3dsRequest({
    //     urlCheckout3ds: "anUrl3ds",
    //     paymentManagerToken: "aPaymentManagerToken" as PaymentManagerToken
    //   })
    // ];

    // eslint-disable-next-line functional/no-let
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      ToBeTested,
      ROUTES.WALLET_ADD_CARD,
      params,
      store
    );

    const finalState: GlobalState = {
      wallet: {
        ...globalState.wallet,
        wallets: {
          ...globalState.wallet.wallets,
          creditCardVerification: pot.some({}),
          creditCardAddWallet: pot.some({})
        }
      }
    } as GlobalState;
    const finalStore = createStore(appReducer, finalState as any);
    component.rerender(<Provider store={finalStore}>{ToBeTested}</Provider>);

    const loadingModal = component.getAllByTestId("overlayComponent");
    const loadingText = component.getByText(
      I18n.t("wallet.saveCard.loadingAlert")
    );

    expect(loadingModal).not.toBeNull();
    expect(loadingText).not.toBeEmpty();
  });
});
