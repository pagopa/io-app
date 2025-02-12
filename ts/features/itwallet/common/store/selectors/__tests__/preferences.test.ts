import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwIsDiscoveryBannerHiddenSelector,
  itwIsFeedbackBannerHiddenSelector,
  itwRequestedCredentialsSelector
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

describe("itwRequestedCredentialsSelector", () => {
  it("should return the list of requested credentials in the past 24 hours", () => {
    MockDate.set("2023-11-15T20:43:21.361Z");

    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwRequestedCredentialsSelector(
        _.set(globalState, "features.itWallet.preferences", {
          requestedCredentials: {
            MDL: "2023-11-14T20:43:21.362Z",
            EuropeanDisabilityCard: "2023-11-14T20:43:21.360Z",
            EuropeanHealthInsuranceCard: "2023-11-14T20:43:21.361Z"
          }
        })
      )
    ).toEqual(["MDL"]);
    MockDate.reset();
  });
});

describe("itwAuthLevelSelector", () => {
  it("should return the auth level used when issuing the eid", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwAuthLevelSelector(
        _.set(globalState, "features.itWallet.preferences", {
          authLevel: "L2"
        })
      )
    ).toEqual("L2");
    MockDate.reset();
  });
});
