import { createStore, DeepPartial, Store } from "redux";
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
import {
  CreditCardPaymentMethod,
  PayPalPaymentMethod
} from "../../../../types/pagopa";
import I18n from "../../../../i18n";
import { paymentMethodByIdSelector } from "../../../../store/reducers/wallet/wallets";
import { isPaypalEnabledSelector } from "../../../../store/reducers/backendStatus";

// Mock react native share
jest.mock("react-native-share", () => jest.fn());

// Be sure that navigation is unmocked
jest.unmock("react-navigation");

// Mock the internal payment method
jest.mock("../../../../store/reducers/wallet/wallets", () => {
  const actualModule = jest.requireActual(
    "../../../../store/reducers/wallet/wallets"
  );

  return {
    __esModule: true,
    ...actualModule,
    paymentMethodByIdSelector: jest.fn()
  };
});

// Mock feature flags
jest.mock("../../../../store/reducers/backendStatus", () => {
  const actualModule = jest.requireActual(
    "../../../../store/reducers/backendStatus"
  );

  return {
    __esModule: true,
    ...actualModule,
    isPaypalEnabledSelector: jest.fn()
  };
});

// Credit card payment method stub
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

// PayPal card payment method stub
const paypalEmail = "email@email.com";
const payPalPaymentMethod = {
  kind: "PayPal",
  info: {
    pspInfo: [
      {
        email: paypalEmail
      }
    ]
  },
  caption: "caption"
} as DeepPartial<PayPalPaymentMethod>;

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

  it("should display all the informations correctly for a `CreditCard` payment method", () => {
    (paymentMethodByIdSelector as unknown as jest.Mock).mockReturnValue(
      creditCardPaymentMethod
    );

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

    // It should retrieve two `Edit` text
    // one for the payment method and one
    // for the PSP.
    expect(
      rendered.getAllByText(I18n.t("wallet.ConfirmPayment.edit"))
    ).toHaveLength(2);
  });

  it("should display all the informations correctly for a `PayPal` payment method", () => {
    (paymentMethodByIdSelector as unknown as jest.Mock).mockReturnValue(
      payPalPaymentMethod
    );

    (isPaypalEnabledSelector as unknown as jest.Mock).mockReturnValue(true);

    const rendered = renderScreenFakeNavRedux<
      GlobalState,
      ConfirmPaymentMethodScreenNavigationParams
    >(
      ConfirmPaymentMethodScreen,
      ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      {
        ...params,
        wallet: {
          ...params.wallet,
          paymentMethod: payPalPaymentMethod as PayPalPaymentMethod
        }
      },
      myStore
    );

    // Should display the payment reason
    rendered.getByText(params.verifica.causaleVersamento);

    // Should display the payment amount
    // rendered.getByText(
    //  formatNumberCentsToAmount(params.verifica.importoSingoloVersamento, true)
    // );

    // Should display the payment method
    rendered.getByText(`PayPal`);

    rendered.getByText(`${paypalEmail}`);

    // Should render the PSP with the fees
    // rendered.getByText(
    //   formatNumberCentsToAmount(params.wallet.psp?.fixedCost.amount ?? -1, true)
    // );

    // rendered.getByText(
    //  `${I18n.t("wallet.ConfirmPayment.providedBy")} ${
    //    params.wallet.psp?.businessName
    //  }`
    // );

    // It should retrieve one `Edit` text, only
    // the one for the payment method.
    expect(
      rendered.getAllByText(I18n.t("wallet.ConfirmPayment.edit"))
    ).toHaveLength(1);
  });
});
