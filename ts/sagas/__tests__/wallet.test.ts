import { some } from "fp-ts/lib/Option";
import { pot } from "italia-ts-commons";
import { none } from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { ActionType, getType } from "typesafe-actions";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import { bpdEnabledSelector } from "../../features/bonus/bpd/store/reducers/details/activation";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardSuccess,
  addWalletCreditCardWithBackoffRetryRequest,
  addWalletNewCreditCardSuccess,
  creditCardCheckout3dsRequest,
  creditCardCheckout3dsSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationSuccess,
  payCreditCardVerificationWithBackoffRetryRequest,
  runStartOrResumeAddCreditCardSaga,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { getAllWallets } from "../../store/reducers/wallet/wallets";
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
import { testableWalletsSaga } from "../wallet";

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

const aCreditCard = {
  pan: "1234567891234567890" as CreditCardPan,
  holder: "Maria Rossi",
  expireMonth: "1" as CreditCardExpirationMonth,
  expireYear: "25" as CreditCardExpirationYear,
  securityCode: "123" as CreditCardCVC
};

const anAction = {
  payload: {
    creditCard: aCreditCard,
    setAsFavorite: true,
    onSuccess: undefined
  }
} as ActionType<typeof runStartOrResumeAddCreditCardSaga>;

const aCreditCardWallet: NullableWallet = {
  idWallet: undefined,
  type: TypeEnum.CREDIT_CARD,
  favourite: anAction.payload.setAsFavorite,
  creditCard: anAction.payload.creditCard,
  psp: undefined
};
describe("startOrResumeAddCreditCardSaga", () => {
  it("should add a card if all the 4 steps run sucessfully", () => {
    const aPMToken = "1234" as PaymentManagerToken;
    const aPmSessionManager: SessionManager<PaymentManagerToken> = new SessionManager(
      jest.fn(() => Promise.resolve(some(aPMToken)))
    );
    const aNewPMToken = "5678" as PaymentManagerToken;
    jest
      .spyOn(aPmSessionManager, "getNewToken")
      .mockReturnValue(Promise.resolve(some(aNewPMToken)));
    const anIdWallet = 123456;

    const aPayRequest: PayRequest = {
      data: {
        idWallet: anIdWallet,
        tipo: "web",
        cvv: anAction.payload.creditCard.securityCode
      }
    };

    const walletStateCardAdded = {
      ...walletState,
      creditCardAddWallet: pot.some({ data: { idWallet: anIdWallet } })
    };

    const anUrlCheckout3ds = "http://192.168.1.7:3000/wallet/loginMethod";

    const walletStateCardVerified = {
      ...walletStateCardAdded,
      creditCardVerification: pot.some({
        data: { urlCheckout3ds: anUrlCheckout3ds }
      }),
      creditCardCheckout3ds: none
    };

    const walletStateCardCheckout3ds = {
      ...walletStateCardVerified,
      creditCardCheckout3ds: pot.some("1234")
    };
    testSaga(
      testableWalletsSaga!.startOrResumeAddCreditCardSaga,
      aPmSessionManager,
      anAction
    )
      // Step 1
      .next()
      .select(getAllWallets)
      .next(walletState)
      .put(
        addWalletCreditCardWithBackoffRetryRequest({
          creditcard: aCreditCardWallet
        })
      )
      .next()
      .take([
        getType(addWalletCreditCardSuccess),
        getType(addWalletCreditCardFailure)
      ])
      .next(getType(addWalletCreditCardSuccess))
      // Step 2
      .select(getAllWallets)
      .next(walletStateCardAdded)
      .put(
        payCreditCardVerificationWithBackoffRetryRequest({
          payRequest: aPayRequest,
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
      .select(getAllWallets)
      .next(walletStateCardVerified)
      .call(aPmSessionManager.getNewToken)
      .next(some(aNewPMToken))
      .put(
        creditCardCheckout3dsRequest({
          urlCheckout3ds: anUrlCheckout3ds,
          paymentManagerToken: aNewPMToken
        })
      )
      .next()
      .take(getType(creditCardCheckout3dsSuccess))
      .next(getType(creditCardCheckout3dsSuccess))
      // Step 4
      .select(getAllWallets)
      .next(walletStateCardCheckout3ds)
      .call(aPmSessionManager.getNewToken)
      .next()
      .put(fetchWalletsRequest())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next({
        type: getType(fetchWalletsSuccess),
        payload: [{ idWallet: anIdWallet }]
      })
      .select(bpdEnabledSelector)
      .next(pot.some(true))
      .put(addWalletNewCreditCardSuccess())
      .next()
      .put(setFavouriteWalletRequest(anIdWallet))
      .next();
  });
});
