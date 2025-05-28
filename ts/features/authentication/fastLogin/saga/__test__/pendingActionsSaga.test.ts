import {
  put,
  select,
  takeLatest,
  delay,
  race,
  take
} from "typed-redux-saga/macro";
import {
  testableHandleApplicationInitialized,
  watchPendingActionsSaga
} from "../pendingActionsSaga";
import { applicationInitialized } from "../../../../../store/actions/application";
import { clearPendingAction } from "../../store/actions/tokenRefreshActions";
import { fastLoginPendingActionsSelector } from "../../store/selectors";

jest.mock("../../store/selectors", () => ({
  fastLoginPendingActionsSelector: jest.fn()
}));

describe("pendingActionsSaga", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  if (!testableHandleApplicationInitialized) {
    throw new Error(
      "handleApplicationInitialized is not available in test environment"
    );
  }
  const handleApplicationInitialized =
    testableHandleApplicationInitialized.handleApplicationInitialized;

  it("should watch applicationInitialized with takeLatest", () => {
    const gen = watchPendingActionsSaga();
    const result = gen.next().value;
    expect(result).toEqual(
      takeLatest(applicationInitialized, handleApplicationInitialized)
    );
  });

  it("should exit early if no pending actions", () => {
    const action = applicationInitialized({ actionsToWaitFor: [] });

    const gen = handleApplicationInitialized(action);
    // select fastLoginPendingActionsSelector
    expect(gen.next().value).toEqual(select(fastLoginPendingActionsSelector));
    // simulate empty array
    expect(gen.next([]).done).toBe(true);
  });

  it("should wait for actions then dispatch pending ones", () => {
    const pendingAction = { type: "PENDING_ACTION" };
    const waitAction = "WAIT_ACTION";
    const action = applicationInitialized({ actionsToWaitFor: [waitAction] });

    const gen = handleApplicationInitialized(action);

    // select pending actions
    expect(gen.next().value).toEqual(select(fastLoginPendingActionsSelector));
    // simulate a pending action
    expect(gen.next([pendingAction]).value).toEqual(
      race({
        take: take(waitAction),
        timeout: delay(3000)
      })
    );
    // simulate race outcome (timeout or take)
    expect(gen.next({ timeout: true }).value).toEqual(put(pendingAction));
    expect(gen.next().value).toEqual(put(clearPendingAction()));
    expect(gen.next().done).toBe(true);
  });
});
