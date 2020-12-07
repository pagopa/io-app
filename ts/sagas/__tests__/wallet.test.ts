import { pot } from "italia-ts-commons";
import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
// import { TypeEnum } from "../../../definitions/pagopa/Wallet";
import {
  // addWalletCreditCardRequest,
  runStartOrResumeAddCreditCardSaga,
  walletsSelector
} from "../../store/actions/wallet/wallets";
import { PaymentManagerToken } from "../../types/pagopa";
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
  creditCardAddWallet: pot.none
};

// const creditCardWallet: NullableWallet = {
//   idWallet: undefined,
//   type: TypeEnum.CREDIT_CARD,
//   favourite: true,
//   creditCard: {},
//   psp: undefined
// };

describe("startOrResumeAddCreditCardSaga", () => {
  it("should dispatch startApplicationInitialization if installation id response is 200 but session is none", () => {
    const fakePmSessionManager = {} as SessionManager<PaymentManagerToken>;
    const fakeAction = {
      payload: {
        setAsFavorite: true
      }
    } as ActionType<typeof runStartOrResumeAddCreditCardSaga>;
    // const mockWalletSelector = (state: GlobalState) => state.wallet.wallets;

    // eslint-disable-next-line
    testSaga(startOrResumeAddCreditCardSaga, fakePmSessionManager, fakeAction)
      .next()
      .select(walletsSelector)
      .next(walletState);
    // .put(addWalletCreditCardRequest({ creditcard: creditCardWallet }));
  });
});
