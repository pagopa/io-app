import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwIsDiscoveryBannerHiddenSelector,
  itwIsFeedbackBannerHiddenSelector
} from "../preferences";

describe("itwIsFeedbackBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [false, "definitely not a date"],
    [false, new Date().toISOString()],
    [false, addDays(new Date(), -2).toISOString()],
    [true, addMonths(new Date(), 1).toISOString()],
    [true, addMonths(new Date(), 2).toISOString()]
  ])("should return %p if banner is hidden until %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsFeedbackBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideFeedbackBannerUntilDate: value
        })
      )
    ).toBe(expected);
  });
});

describe("itwIsDiscoveryBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [false, "definitely not a date"],
    [false, new Date().toISOString()],
    [false, addDays(new Date(), -2).toISOString()],
    [true, addMonths(new Date(), 2).toISOString()]
  ])("should return %p if banner is hidden until %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsDiscoveryBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideDiscoveryBannerUntilDate: value
        })
      )
    ).toBe(expected);
  });
});
