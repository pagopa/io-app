import { TourState, tourInitialState } from "../../reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isTourActiveSelector,
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector,
  isTourCompletedSelector
} from "../index";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const makeState = (overrides: Partial<TourState> = {}): GlobalState =>
  ({
    features: {
      tour: {
        ...tourInitialState,
        ...overrides
      }
    }
  } as unknown as GlobalState);

describe("tour selectors", () => {
  describe("isTourActiveSelector", () => {
    it("returns false when no activeGroupId is set", () => {
      expect(isTourActiveSelector(makeState())).toBe(false);
    });

    it("returns true when activeGroupId is set", () => {
      expect(isTourActiveSelector(makeState({ activeGroupId: "groupA" }))).toBe(
        true
      );
    });
  });

  describe("activeGroupIdSelector", () => {
    it("returns undefined when no tour is active", () => {
      expect(activeGroupIdSelector(makeState())).toBeUndefined();
    });

    it("returns the active group id", () => {
      expect(
        activeGroupIdSelector(makeState({ activeGroupId: "groupA" }))
      ).toBe("groupA");
    });
  });

  describe("activeStepIndexSelector", () => {
    it("returns 0 by default", () => {
      expect(activeStepIndexSelector(makeState())).toBe(0);
    });

    it("returns the current step index", () => {
      expect(activeStepIndexSelector(makeState({ activeStepIndex: 3 }))).toBe(
        3
      );
    });
  });

  describe("tourItemsForActiveGroupSelector", () => {
    it("returns an empty array when no group is active", () => {
      const items = tourItemsForActiveGroupSelector(makeState());
      expect(items).toEqual([]);
    });

    it("returns an empty array when the active group has no registered items", () => {
      const items = tourItemsForActiveGroupSelector(
        makeState({ activeGroupId: "groupA" })
      );
      expect(items).toEqual([]);
    });

    it("returns items sorted by index ascending", () => {
      const state = makeState({
        activeGroupId: "groupA",
        items: {
          groupA: [
            { groupId: "groupA", index: 2 },
            { groupId: "groupA", index: 0 },
            { groupId: "groupA", index: 1 }
          ]
        }
      });
      const items = tourItemsForActiveGroupSelector(state);
      expect(items.map(i => i.index)).toEqual([0, 1, 2]);
    });

    it("does not return items from other groups", () => {
      const state = makeState({
        activeGroupId: "groupA",
        items: {
          groupA: [{ groupId: "groupA", index: 0 }],
          groupB: [{ groupId: "groupB", index: 0 }]
        }
      });
      const items = tourItemsForActiveGroupSelector(state);
      expect(items).toHaveLength(1);
      expect(items[0].groupId).toBe("groupA");
    });
  });

  describe("isTourCompletedSelector", () => {
    it("returns false when the group is not in completed list", () => {
      expect(isTourCompletedSelector(makeState(), "groupA")).toBe(false);
    });

    it("returns true when the group is in completed list", () => {
      expect(
        isTourCompletedSelector(
          makeState({ completed: ["groupA", "groupB"] }),
          "groupA"
        )
      ).toBe(true);
    });
  });
});
