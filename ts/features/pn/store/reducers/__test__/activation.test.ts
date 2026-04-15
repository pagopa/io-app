import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { pnActivationUpsert } from "../../actions";
import {
  PnActivationState,
  isLoadingPnActivationSelector,
  pnActivationReducer
} from "../activation";

describe("pnActivationReducer", () => {
  const initialState: PnActivationState = {
    isActivating: false
  };

  it("should return the initial state", () => {
    expect(
      pnActivationReducer(undefined, applicationChangeState("active"))
    ).toEqual(initialState);
  });

  it("should handle pnActivationUpsert.request", () => {
    const action = pnActivationUpsert.request({ value: true });

    expect(pnActivationReducer(initialState, action)).toEqual({
      isActivating: true
    });
  });

  it("should handle pnActivationUpsert.success", () => {
    const state: PnActivationState = {
      isActivating: true
    };
    const action = pnActivationUpsert.success();
    expect(pnActivationReducer(state, action)).toEqual({
      isActivating: false
    });
  });

  it("should handle pnActivationUpsert.failure", () => {
    const state: PnActivationState = {
      isActivating: true
    };
    const action = pnActivationUpsert.failure();
    expect(pnActivationReducer(state, action)).toEqual({
      isActivating: false
    });
  });
});

describe("isLoadingPnActivationSelector", () => {
  it("should return isActivating value from the state", () => {
    const state = {
      features: {
        pn: {
          activation: {
            isActivating: true
          }
        }
      }
    } as GlobalState;

    expect(isLoadingPnActivationSelector(state)).toBe(true);
  });
});
