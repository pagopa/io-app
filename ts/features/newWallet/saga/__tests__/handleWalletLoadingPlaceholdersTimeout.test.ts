import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { testSaga } from "redux-saga-test-plan";
import { delay } from "typed-redux-saga";
import { getType } from "typesafe-actions";
import {
  walletResetPlaceholders,
  walletToggleLoadingState
} from "../../store/actions/placeholders";
import { selectWalletCards } from "../../store/selectors";
import { WalletCard } from "../../types";
import { handleWalletPlaceholdersTimeout } from "../handleWalletLoadingPlaceholdersTimeout";

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

describe("handleWalletLoadingPlaceholdersTimeout", () => {
  it("does nothing if loading state is being disabled", () => {
    testSaga(
      handleWalletPlaceholdersTimeout,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(false)
    )
      .next()
      .isDone();
  });

  it(`dispatches ${getType(walletResetPlaceholders)} after timeout`, () => {
    testSaga(
      handleWalletPlaceholdersTimeout,
      LOADING_STATE_TIMEOUT,
      walletToggleLoadingState(true)
    )
      .next()
      .next(delay(LOADING_STATE_TIMEOUT))
      .select(selectWalletCards)
      .next(T_CARDS)
      .put(walletResetPlaceholders(T_CARDS))
      .next()
      .next()
      .isDone();
  });
});
