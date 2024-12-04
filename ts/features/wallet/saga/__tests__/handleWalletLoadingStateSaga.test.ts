import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { testSaga } from "redux-saga-test-plan";
import { delay } from "typed-redux-saga";
import { getType } from "typesafe-actions";
import { walletAddCards } from "../../store/actions/cards";
import { walletToggleLoadingState } from "../../store/actions/placeholders";
import { selectWalletCards } from "../../store/selectors";
import { WalletCard } from "../../types";
import { handleWalletLoadingStateSaga } from "../handleWalletLoadingStateSaga";

const LOADING_STATE_TIMEOUT = 2000 as Millisecond;

const T_CARDS: ReadonlyArray<WalletCard> = [
  {
    type: "payment",
    category: "payment",
    walletId: "1",
    key: "1"
  },
  {
    type: "payment",
    category: "payment",
    walletId: "2",
    key: "2"
  }
];

describe("handleWalletLoadingStateSaga", () => {
  it("does nothing if loading state is being disabled", () => {
    testSaga(
      handleWalletLoadingStateSaga,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(false)
    )
      .next()
      .select(selectWalletCards)
      .next([])
      .isDone();
  });

  it("does nothing if loading state is enabled and there are already some cards in the wallet", () => {
    testSaga(
      handleWalletLoadingStateSaga,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(true)
    )
      .next()
      .select(selectWalletCards)
      .next(T_CARDS)
      .isDone();
  });

  it(`disables the loading state as soon as ${getType(
    walletAddCards
  )} action is dispatched`, () => {
    testSaga(
      handleWalletLoadingStateSaga,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(true)
    )
      .next()
      .select(selectWalletCards)
      .next([])
      .next(walletAddCards(T_CARDS))
      .put(walletToggleLoadingState(false))
      .next()
      .isDone();
  });

  it(`disables the loading state after timeout`, () => {
    testSaga(
      handleWalletLoadingStateSaga,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(true)
    )
      .next()
      .select(selectWalletCards)
      .next([])
      .next(delay(LOADING_STATE_TIMEOUT))
      .put(walletToggleLoadingState(false))
      .next()
      .isDone();
  });
});
