import { createStore, Store } from "redux";
import ConfirmPaymentMethodScreen, {
  ConfirmPaymentMethodScreenNavigationParams
} from "../ConfirmPaymentMethodScreen";
import {
  myRptId,
  myInitialAmount,
  myVerifiedData,
  myWallet,
  myPsp,
  AuthSeq
} from "../../../../utils/testFaker";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { appReducer } from "../../../../store/reducers/";
import ROUTES from "../../../../navigation/routes";
import { GlobalState } from "../../../../store/reducers/types";
import { reproduceSequence } from "../../../../utils/tests";
import {
  formatNumberCentsToAmount,
  buildExpirationDate
} from "../../../../utils/stringBuilder";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import I18n from "../../../../i18n";

// Mock react native share
jest.mock("react-native-share", () => jest.fn());

// Be sure that navigation is unmocked
jest.unmock("react-navigation");

// Mock the internal payment method
const creditCardPaymentMethod = {
  kind: "CreditCard",
  info: {
    type: "CRD",
    holder: "holder",
    expireMonth: "03",
    expireYear: "2022"
  },
  caption: "caption"
} as CreditCardPaymentMethod;

jest.mock("../../../../store/reducers/wallet/wallets.ts", () => {
  const actualModule = jest.requireActual(
    "../../../../store/reducers/wallet/wallets.ts"
  );

  return {
    __esModule: true,
    ...actualModule,

    paymentMethodByIdSelector: jest
      .fn()
      .mockReturnValue(creditCardPaymentMethod)
  };
});

describe("Integration Tests With Actual Store and Simplified Navigation", () => {
  afterAll(() => jest.resetAllMocks());
  beforeEach(() => jest.useFakeTimers());

  const initState = reproduceSequence({} as GlobalState, appReducer, AuthSeq);

  const params: ConfirmPaymentMethodScreenNavigationParams = {
    rptId: myRptId,
    initialAmount: myInitialAmount,
    verifica: myVerifiedData,
    idPayment: "hjkdhgkdj",
    wallet: myWallet,
    psps: [myPsp]
  };

  // Store with the true appReducer
  const myStore: Store<GlobalState> = createStore(appReducer, initState as any);

  it("should display all the informations correctly", () => {
    const rendered = renderScreenFakeNavRedux<
      GlobalState,
      ConfirmPaymentMethodScreenNavigationParams
    >(
      ConfirmPaymentMethodScreen,
      ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      params,
      myStore
    );

    // Should display the payment reason
    rendered.getByText(params.verifica.causaleVersamento);

    // Should display the payment amount
    rendered.getByText(
      formatNumberCentsToAmount(params.verifica.importoSingoloVersamento, true)
    );

    // Should display the payment method
    rendered.getByText(creditCardPaymentMethod.caption);

    rendered.getByText(
      `${creditCardPaymentMethod.info.holder} · ${buildExpirationDate(
        creditCardPaymentMethod.info
      )}`
    );

    // Should render the PSP with the fees
    rendered.getByText(
      formatNumberCentsToAmount(params.wallet.psp?.fixedCost.amount ?? -1, true)
    );

    rendered.getByText(
      `${I18n.t("wallet.ConfirmPayment.providedBy")} ${
        params.wallet.psp?.businessName
      }`
    );
  });
});
