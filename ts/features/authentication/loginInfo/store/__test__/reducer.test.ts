import { loginInfoReducer } from "../reducers"; // aggiorna il path se serve
import { loginSuccess } from "../../../common/store/actions";
import { SessionToken } from "../../../../../types/SessionToken";

describe("loginInfoReducer", () => {
  it("should return the initial state", () => {
    const initialState = loginInfoReducer(undefined, {
      type: "UNKNOWN"
    } as any);
    expect(initialState).toEqual({ userFromSuccessLogin: false });
  });

  it("should handle loginSuccess and set userFromSuccessLogin to true", () => {
    const action = loginSuccess({
      token: "faketoken" as SessionToken,
      idp: "test"
    });

    const state = loginInfoReducer(undefined, action);
    expect(state).toEqual({ userFromSuccessLogin: true });
  });

  it("should not change state for unknown actions", () => {
    const currentState = { userFromSuccessLogin: true };
    const action = { type: "UNKNOWN_ACTION" } as any;
    const newState = loginInfoReducer(currentState, action);
    expect(newState).toBe(currentState);
  });
});
