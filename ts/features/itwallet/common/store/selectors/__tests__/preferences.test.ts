import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwIsFeedbackBannerHiddenSelector } from "../preferences";

describe("itwIsFeedbackBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [true, "always"],
    [true, { until: addMonths(new Date(), 2) }],
    [false, { until: addDays(new Date(), -2) }]
  ])("should return %p if banner is hidden %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsFeedbackBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideFeedbackBanner: value
        })
      )
    ).toBe(expected);
  });
});
