import { applicationChangeState } from "../../../../../../store/actions/application";
import { itwLifecycleStoresReset } from "../../../../lifecycle/store/actions";
import { itwCloseBanner, itwShowBanner } from "../../actions/banners";
import reducer, { itwBannersInitialState, ItwBannersState } from "../banners";

describe("IT Wallet banners reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      itwBannersInitialState
    );
  });

  it("should handle itwLifecycleStoresReset action", () => {
    const initialState: ItwBannersState = {
      discovery: {
        dismissedOn: new Date().toISOString(),
        dismissCount: 2
      },
      upgradeMDLDetails: {
        dismissedOn: new Date().toISOString(),
        dismissCount: 2
      }
    };

    const expectedState: ItwBannersState = {
      discovery: {},
      upgradeMDLDetails: {}
    };

    const action = itwLifecycleStoresReset();
    const newState = reducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  it("should handle itwCloseBanner action", () => {
    const action = itwCloseBanner("discovery");
    const newState = reducer(itwBannersInitialState, action);

    expect(newState).toEqual({
      ...newState,
      discovery: {
        dismissedOn: expect.any(String),
        dismissCount: 1
      }
    });
  });

  it("should handle itwShowBanner action", () => {
    const initialState: ItwBannersState = {
      discovery: {
        dismissedOn: new Date().toISOString(),
        dismissCount: 2
      },
      upgradeMDLDetails: {
        dismissedOn: new Date().toISOString(),
        dismissCount: 2
      }
    };

    const action = itwShowBanner("discovery");
    const newState = reducer(initialState, action);

    expect(newState).toEqual({
      ...newState,
      discovery: {}
    });
  });
});
