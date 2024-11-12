import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwIsFeedbackBannerHiddenSelector } from "../preferences";

describe("itwIsFeedbackBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [true, addMonths(new Date(), 1)],
    [false, addDays(new Date(), -2)]
  ])("should return %p if banner is hidden until %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsFeedbackBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideFeedbackBannerUntil: value
        })
      )
    ).toBe(expected);
  });
});
