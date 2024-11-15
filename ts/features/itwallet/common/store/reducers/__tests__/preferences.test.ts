import { addMonths } from "date-fns";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { itwCloseFeedbackBanner } from "../../actions/preferences";
import reducer, { ItwPreferencesState } from "../preferences";

describe("IT Wallet preferences reducer", () => {
  const INITIAL_STATE: ItwPreferencesState = {};

  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      INITIAL_STATE
    );
  });

  it("should handle itwCloseFeedbackBanner action", () => {
    const mockDate = "2024-11-14T20:43:21.361Z";
    MockDate.set(mockDate);

    const expectedDate = addMonths(mockDate, 1);
    const action = itwCloseFeedbackBanner();
    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      hideFeedbackBannerUntilDate: expectedDate.toISOString()
    });
    MockDate.reset();
  });
});
