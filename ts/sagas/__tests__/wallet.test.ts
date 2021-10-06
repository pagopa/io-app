import { some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { ActionType, getType } from "typesafe-actions";
import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import { addCreditCardOutcomeCode } from "../../store/actions/wallet/outcomeCode";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardSuccess,
  addWalletCreditCardWithBackoffRetryRequest,
  addWalletNewCreditCardSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  refreshPMTokenWhileAddCreditCard,
  runStartOrResumeAddCreditCardSaga,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import {
  lastPaymentOutcomeCodeSelector,
  OutcomeCodeState
} from "../../store/reducers/wallet/outcomeCode";
import { getAllWallets } from "../../store/reducers/wallet/wallets";
import { OutcomeCode } from "../../types/outcomeCode";
import { NullableWallet, PaymentManagerToken } from "../../types/pagopa";
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

const anOutcomeCode: OutcomeCodeState = {
  outcomeCode: some({ status: "success" } as OutcomeCode)
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
    const aPmSessionManager: SessionManager<PaymentManagerToken> =
      new SessionManager(jest.fn(() => Promise.resolve(some(aPMToken))));
    const aNewPMToken = "5678" as PaymentManagerToken;
    jest
      .spyOn(aPmSessionManager, "getNewToken")
      .mockReturnValue(Promise.resolve(some(aNewPMToken)));
    const anIdWallet = 123456;

    const walletStateCardAdded = {
      ...walletState,
      creditCardAddWallet: pot.some({ data: { idWallet: anIdWallet } })
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
      .put(refreshPMTokenWhileAddCreditCard.request({ idWallet: anIdWallet }))
      .next()
      .call(aPmSessionManager.getNewToken)
      .next(some(aNewPMToken))
      .put(refreshPMTokenWhileAddCreditCard.success(aNewPMToken))
      .next()
      .take(getType(addCreditCardOutcomeCode))
      .next()
      .select(lastPaymentOutcomeCodeSelector)
      .next(anOutcomeCode)
      .put(addWalletNewCreditCardSuccess())
      .next()
      .put(fetchWalletsRequest())
      .next()
      .take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)])
      .next({
        type: getType(fetchWalletsSuccess),
        payload: [{ idWallet: anIdWallet }]
      })
      .delay(testableWalletsSaga!.successScreenDelay)
      .next()
      .put(setFavouriteWalletRequest(anIdWallet))
      .next();
  });
});
