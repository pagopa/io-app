import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";

import * as analytics from "../../analytics";
import { completeTourAction, startTourAction } from "../../store/actions";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector
} from "../../store/selectors";
import { testable } from "../index";

const { handleStartTour, handleNextStep } = testable!;

jest.mock("../../analytics", () => ({
  trackTourGuideAction: jest.fn()
}));

const mockTrack = analytics.trackTourGuideAction as jest.Mock;

describe("handleStartTour", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks "shown" for the given groupId', async () => {
    const action = startTourAction({ groupId: "tourA" });
    await expectSaga(handleStartTour, action).run();
    expect(mockTrack).toHaveBeenCalledWith("tourA", "shown");
  });
});

describe("handleNextStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches completeTourAction when stepIndex >= items length", () =>
    expectSaga(handleNextStep)
      .provide([
        [select(activeGroupIdSelector), "tourA"],
        [select(activeStepIndexSelector), 2],
        [
          select(tourItemsForActiveGroupSelector),
          [
            { groupId: "tourA", index: 0 },
            { groupId: "tourA", index: 1 }
          ]
        ]
      ])
      .put(completeTourAction({ groupId: "tourA" }))
      .run());

  it("does NOT dispatch completeTourAction when there are more steps", () =>
    expectSaga(handleNextStep)
      .provide([
        [select(activeGroupIdSelector), "tourA"],
        [select(activeStepIndexSelector), 0],
        [
          select(tourItemsForActiveGroupSelector),
          [
            { groupId: "tourA", index: 0 },
            { groupId: "tourA", index: 1 }
          ]
        ]
      ])
      .not.put(completeTourAction({ groupId: "tourA" }))
      .run());

  it("does NOT dispatch completeTourAction when no group is active", () =>
    expectSaga(handleNextStep)
      .provide([
        [select(activeGroupIdSelector), undefined],
        [select(activeStepIndexSelector), 5],
        [select(tourItemsForActiveGroupSelector), []]
      ])
      .not.put.actionType(completeTourAction.toString())
      .run());
});
