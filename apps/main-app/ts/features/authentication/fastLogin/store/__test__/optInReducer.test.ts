import {
  fastLoginOptInInitialState,
  FastLoginOptInState,
  testableFastLoginOptInReducer
} from "../reducers/optInReducer";
import {
  logoutSuccess,
  logoutFailure
} from "../../../../authentication/common/store/actions";
import { setFastLoginOptIn } from "../actions/optInActions";

describe("fastLoginOptInReducer", () => {
  if (!testableFastLoginOptInReducer) {
    throw new Error(
      "fastLoginOptInReducer is not available in test environment"
    );
  }
  const fastLoginOptInReducer =
    testableFastLoginOptInReducer.fastLoginOptInReducer;

  it("should return initial state by default", () => {
    const state = fastLoginOptInReducer(undefined, {
      type: "UNKNOWN_ACTION"
    } as any);
    expect(state).toEqual(fastLoginOptInInitialState);
  });

  it("should reset state on logoutSuccess", () => {
    const currentState: FastLoginOptInState = { enabled: true };
    const state = fastLoginOptInReducer(currentState, logoutSuccess());
    expect(state).toEqual(fastLoginOptInInitialState);
  });

  it("should reset state on logoutFailure", () => {
    const currentState: FastLoginOptInState = { enabled: true };
    const state = fastLoginOptInReducer(
      currentState,
      logoutFailure({ error: new Error("fail") })
    );
    expect(state).toEqual(fastLoginOptInInitialState);
  });

  it("should update enabled value on setFastLoginOptIn", () => {
    const currentState: FastLoginOptInState = { enabled: false };
    const state = fastLoginOptInReducer(
      currentState,
      setFastLoginOptIn({ enabled: true })
    );
    expect(state).toEqual({ enabled: true });
  });
});
