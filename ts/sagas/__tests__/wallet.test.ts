import { fromNullable } from "fp-ts/lib/Option";
import { pot } from "italia-ts-commons";
import { testSaga } from "redux-saga-test-plan";
import { ActionType, getType } from "typesafe-actions";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationRequest,
  payCreditCardVerificationSuccess,
  runStartOrResumeAddCreditCardSaga,
  walletsSelector
} from "../../store/actions/wallet/wallets";
import {
  NullableWallet,
  PaymentManagerToken,
  PayRequest
} from "../../types/pagopa";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../utils/input";
import { SessionManager } from "../../utils/SessionManager";
import { startOrResumeAddCreditCardSaga } from "../wallet";

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("../../api/backend");

const walletState = {
  walletById: pot.none,
  creditCardAddWallet: pot.none,
  creditCardVerification: pot.none
};

const fakeCreditCard = {
  pan: "1234567891234567890" as CreditCardPan,
  holder: "Maria Rossi",
  expireMonth: "1" as CreditCardExpirationMonth,
  expireYear: "25" as CreditCardExpirationYear,
  securityCode: "123" as CreditCardCVC
};

const fakeAction = {
  payload: {
    creditCard: fakeCreditCard,
    setAsFavorite: true
  }
} as ActionType<typeof runStartOrResumeAddCreditCardSaga>;

const fakeCreditCardWallet: NullableWallet = {
  idWallet: undefined,
  type: TypeEnum.CREDIT_CARD,
  favourite: fakeAction.payload.setAsFavorite,
  creditCard: fakeAction.payload.creditCard,
  psp: undefined
};
describe("startOrResumeAddCreditCardSaga", () => {
  it("should dispatch startApplicationInitialization if installation id response is 200 but session is none", () => {
    const fakePmSessionManager = {
      getNewToken: jest.fn() => jest.fn =>
        fromNullable(
          "c21z3oxqcme4zoput62tqky3ldh85efgkpgwbmvbf9o5hyp8te1gc9ovkfeku79f93uai6ihb2hlx5tsbdwq8j15mu0zfftn3a5ci40nxcycodh4ri94jdori1ar53nh" as PaymentManagerToken
        )
    } as SessionManager<PaymentManagerToken>;

    const fakeIdWallet = 123456;

    const fakePayRequest: PayRequest = {
      data: {
        idWallet: fakeIdWallet,
        tipo: "web",
        cvv: fakeAction.payload.creditCard.securityCode
      }
    };

    const walletStateCardAdded = {
      ...walletState,
      creditCardAddWallet: pot.some({ data: { idWallet: fakeIdWallet } })
    };

    const fakeUrlCheckout3ds = "http://192.168.1.7:3000/wallet/loginMethod";

    const walletStateCardVerified = {
      ...walletStateCardAdded,
      creditCardVerification: pot.some({
        data: { urlCheckout3ds: fakeUrlCheckout3ds }
      })
    };

    // eslint-disable-next-line
    testSaga(
      startOrResumeAddCreditCardSaga,
      fakePmSessionManager as SessionManager<PaymentManagerToken>,
      fakeAction
    )
      // Step 1
      .next()
      .select(walletsSelector)
      .next(walletState)
      .put(addWalletCreditCardRequest({ creditcard: fakeCreditCardWallet }))
      .next()
      .take([
        getType(addWalletCreditCardSuccess),
        getType(addWalletCreditCardFailure)
      ])
      .next(getType(addWalletCreditCardSuccess))
      // Step 2
      .select(walletsSelector)
      .next(walletStateCardAdded)
      .put(
        payCreditCardVerificationRequest({
          payRequest: fakePayRequest,
          language: undefined
        })
      )
      .next()
      .take([
        getType(payCreditCardVerificationSuccess),
        getType(payCreditCardVerificationFailure)
      ])
      .next(getType(payCreditCardVerificationSuccess))
      // Step 3
      .select(walletsSelector)
      .next(walletStateCardVerified)
      .call(fakePmSessionManager.getNewToken());
  });
});
