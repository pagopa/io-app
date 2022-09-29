import { createStandardAction } from "typesafe-actions";
import MockDate from "mockdate";
import * as AR from "fp-ts/lib/Array";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";
import { appReducer } from "../index";
import { applicationChangeState } from "../../actions/application";
import { backOffWaitingTime } from "../backoffError";
import * as backoffErrorConfig from "../backoffErrorConfig";

describe("backoffError reducer", () => {
  it("should have a valid initial state", () => {
    const now = new Date();
    MockDate.set(now);
    const backoffConfig = { maxAttempts: 5, base: 2, mul: 1000 };
    // create an action that is monitored by the reducer
    const failureActionType = "test123";
    const aFailureAction = createStandardAction(failureActionType)<void>();
    const successActionType = "123test";
    const aSuccessAction = createStandardAction(successActionType)<void>();

    jest
      .spyOn(backoffErrorConfig, "failureActionTypes")
      .mockImplementation(() => [failureActionType]);
    jest
      .spyOn(backoffErrorConfig, "successActionTypes")
      .mockImplementation(() => [successActionType]);
    jest
      .spyOn(backoffErrorConfig, "backoffConfig")
      .mockImplementation(() => backoffConfig);

    // eslint-disable-next-line functional/no-let
    let state: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    ) as GlobalState;
    // check that attempts increase and wait time is computed as expected
    AR.range(1, backoffConfig.maxAttempts + 1).forEach(attempts => {
      state = appReducer(
        state,
        aFailureAction() as any as Action
      ) as GlobalState;
      expect(state.backoffError).toEqual({
        [failureActionType]: {
          lastUpdate: now,
          attempts: Math.min(attempts, backoffConfig.maxAttempts)
        }
      });
      expect(backOffWaitingTime(state)(aFailureAction)).toEqual(
        Math.pow(
          backoffConfig.base,
          Math.min(attempts, backoffConfig.maxAttempts)
        ) * backoffConfig.mul
      );
    });
    // success action should empty the state
    state = appReducer(state, aSuccessAction() as any as Action) as GlobalState;
    expect(state.backoffError).toEqual({});
  });
});
