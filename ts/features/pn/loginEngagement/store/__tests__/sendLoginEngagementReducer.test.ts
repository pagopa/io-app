import { createStore } from "redux";
import { setSendEngagementScreenHasBeenDismissed } from "../actions";
import { testable, SEND_LOGIN_ENGAGEMENT_INITIAL_STATE } from "../reducers";

const pnLoginEngagementReducer = testable!.sendLoginEngagementReducer;

describe(pnLoginEngagementReducer, () => {
  it("should match initial state upon initialization", () => {
    const store = createStore(pnLoginEngagementReducer);

    expect(store.getState()).toEqual(SEND_LOGIN_ENGAGEMENT_INITIAL_STATE);
  });
  it("should switch hasSendEngagementScreenBeenDismissed to true when setSendEngagementScreenHasBeenDismissed action is dispatched", () => {
    const store = createStore(pnLoginEngagementReducer);

    // hasSendEngagementScreenBeenDismissed should start from false
    expect(store.getState()).toHaveProperty(
      "hasSendEngagementScreenBeenDismissed",
      false
    );

    store.dispatch(setSendEngagementScreenHasBeenDismissed());
    // after dispatching the setSendEngagementScreenHasBeenDismissed action the
    // hasSendEngagementScreenBeenDismissed value should switch to true
    expect(store.getState()).toHaveProperty(
      "hasSendEngagementScreenBeenDismissed",
      true
    );
  });
});
