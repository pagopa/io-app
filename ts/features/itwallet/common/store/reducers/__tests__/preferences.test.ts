import { addMonths } from "date-fns";
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
    const expectedDate = addMonths(new Date(), 1).toISOString();
    const action = itwCloseFeedbackBanner();

    const newState = reducer(INITIAL_STATE, action);

    expect(newState).toEqual({
      ...newState,
      hideFeedbackBannerUntilDate: expectedDate
    });
  });
});
