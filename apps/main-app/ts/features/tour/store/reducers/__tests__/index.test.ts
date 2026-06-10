import {
  completeTourAction,
  nextTourStepAction,
  prevTourStepAction,
  registerTourItemAction,
  resetTourCompletedAction,
  startTourAction,
  stopTourAction,
  unregisterTourItemAction
} from "../../actions";
import persistedReducer, { tourInitialState, TourState } from "../index";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Strip the _persist key added by redux-persist so we can compare plain TourState
const extract = (state: TourState | (TourState & { _persist?: unknown })) => {
  const { _persist, ...rest } = state as TourState & { _persist?: unknown };
  return rest as TourState;
};

// Convenience wrapper so tests interact with a plain TourState-like signature
const reduce = (
  state: TourState | undefined,
  action: Parameters<typeof persistedReducer>[1]
): TourState => extract(persistedReducer(state as any, action));

describe("tour reducer", () => {
  describe("initial state", () => {
    it("returns tourInitialState when called with undefined", () => {
      const state = reduce(undefined, { type: "@@INIT" } as any);
      expect(state).toEqual(tourInitialState);
    });
  });

  describe("registerTourItemAction", () => {
    it("adds a new item to an empty group", () => {
      const state = reduce(
        undefined,
        registerTourItemAction({ groupId: "groupA", index: 0 })
      );
      expect(state.items.groupA).toEqual([{ groupId: "groupA", index: 0 }]);
    });

    it("appends to an existing group", () => {
      const initial: TourState = {
        ...tourInitialState,
        items: { groupA: [{ groupId: "groupA", index: 0 }] }
      };
      const state = reduce(
        initial,
        registerTourItemAction({ groupId: "groupA", index: 1 })
      );
      expect(state.items.groupA).toHaveLength(2);
      expect(state.items.groupA).toContainEqual({
        groupId: "groupA",
        index: 1
      });
    });

    it("creates independent entries for different groups", () => {
      const stateA = reduce(
        undefined,
        registerTourItemAction({ groupId: "groupA", index: 0 })
      );
      const state = reduce(
        stateA,
        registerTourItemAction({ groupId: "groupB", index: 0 })
      );
      expect(Object.keys(state.items)).toHaveLength(2);
    });
  });

  describe("unregisterTourItemAction", () => {
    it("removes the item with the matching index", () => {
      const initial: TourState = {
        ...tourInitialState,
        items: {
          groupA: [
            { groupId: "groupA", index: 0 },
            { groupId: "groupA", index: 1 }
          ]
        }
      };
      const state = reduce(
        initial,
        unregisterTourItemAction({ groupId: "groupA", index: 0 })
      );
      expect(state.items.groupA).toHaveLength(1);
      expect(state.items.groupA[0]).toEqual({ groupId: "groupA", index: 1 });
    });

    it("does nothing when the group is empty", () => {
      const state = reduce(
        undefined,
        unregisterTourItemAction({ groupId: "unknown", index: 0 })
      );
      expect(state.items.unknown).toEqual([]);
    });
  });

  describe("startTourAction", () => {
    it("sets activeGroupId and resets step index", () => {
      const initial: TourState = {
        ...tourInitialState,
        activeStepIndex: 3
      };
      const state = reduce(initial, startTourAction({ groupId: "groupA" }));
      expect(state.activeGroupId).toBe("groupA");
      expect(state.activeStepIndex).toBe(0);
    });

    it("does not start if the group is already completed", () => {
      const initial: TourState = {
        ...tourInitialState,
        completed: ["groupA"]
      };
      const state = reduce(initial, startTourAction({ groupId: "groupA" }));
      expect(state.activeGroupId).toBeUndefined();
    });
  });

  describe("stopTourAction", () => {
    it("clears activeGroupId and resets step index", () => {
      const initial: TourState = {
        ...tourInitialState,
        activeGroupId: "groupA",
        activeStepIndex: 2
      };
      const state = reduce(initial, stopTourAction());
      expect(state.activeGroupId).toBeUndefined();
      expect(state.activeStepIndex).toBe(0);
    });
  });

  describe("nextTourStepAction", () => {
    it("increments activeStepIndex", () => {
      const initial: TourState = { ...tourInitialState, activeStepIndex: 1 };
      const state = reduce(initial, nextTourStepAction());
      expect(state.activeStepIndex).toBe(2);
    });
  });

  describe("prevTourStepAction", () => {
    it("decrements activeStepIndex", () => {
      const initial: TourState = { ...tourInitialState, activeStepIndex: 2 };
      const state = reduce(initial, prevTourStepAction());
      expect(state.activeStepIndex).toBe(1);
    });

    it("does not go below 0", () => {
      const state = reduce(
        { ...tourInitialState, activeStepIndex: 0 },
        prevTourStepAction()
      );
      expect(state.activeStepIndex).toBe(0);
    });
  });

  describe("completeTourAction", () => {
    it("adds groupId to completed, clears active state", () => {
      const initial: TourState = {
        ...tourInitialState,
        activeGroupId: "groupA",
        activeStepIndex: 1
      };
      const state = reduce(initial, completeTourAction({ groupId: "groupA" }));
      expect(state.completed).toContain("groupA");
      expect(state.activeGroupId).toBeUndefined();
      expect(state.activeStepIndex).toBe(0);
    });

    it("does not add a duplicate if already completed", () => {
      const initial: TourState = {
        ...tourInitialState,
        completed: ["groupA"]
      };
      const state = reduce(initial, completeTourAction({ groupId: "groupA" }));
      expect(state.completed.filter(id => id === "groupA")).toHaveLength(1);
    });
  });

  describe("resetTourCompletedAction", () => {
    it("removes the specified groupId from completed", () => {
      const initial: TourState = {
        ...tourInitialState,
        completed: ["groupA", "groupB"]
      };
      const state = reduce(
        initial,
        resetTourCompletedAction({ groupId: "groupA" })
      );
      expect(state.completed).not.toContain("groupA");
      expect(state.completed).toContain("groupB");
    });

    it("is a no-op when the groupId is not in completed", () => {
      const initial: TourState = {
        ...tourInitialState,
        completed: ["groupB"]
      };
      const state = reduce(
        initial,
        resetTourCompletedAction({ groupId: "groupA" })
      );
      expect(state.completed).toEqual(["groupB"]);
    });
  });
});
