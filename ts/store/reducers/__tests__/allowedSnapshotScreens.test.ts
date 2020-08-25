import { bonusVacanzeEnabled } from "../../../config";
import { navigateToBonusActivationCompleted } from "../../../features/bonusVacanze/navigation/action";
import BONUSVACANZE_ROUTES from "../../../features/bonusVacanze/navigation/routes";
import { applicationChangeState } from "../../actions/application";
import { setDebugModeEnabled } from "../../actions/debug";
import {
  isAllowedSnapshotCurrentScreen,
  screenWhiteList
} from "../allowedSnapshotScreens";
import { appReducer } from "../index";
import { GlobalState } from "../types";

jest.mock("@react-native-community/async-storage", () => {
  return {
    AsyncStorage: jest.fn()
  };
});

jest.mock("react-native-share", () => {
  return {
    open: jest.fn()
  };
});

describe("allowed Snapshot Screens Selector test", () => {
  it("Test high level composition", () => {
    // with a screen not snapshottable, expected false
    expect(
      isAllowedSnapshotCurrentScreen.resultFunc(
        "NOT_SNAPSHOTTABLE_SCREEN",
        false
      )
    ).toBeFalsy();
    // with the debug mode enabled, expected true
    expect(
      isAllowedSnapshotCurrentScreen.resultFunc(
        "NOT_SNAPSHOTTABLE_SCREEN",
        true
      )
    ).toBeTruthy();
    if (bonusVacanzeEnabled) {
      expect(
        isAllowedSnapshotCurrentScreen.resultFunc(
          BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
          false
        )
      ).toBeTruthy();
      expect(
        isAllowedSnapshotCurrentScreen.resultFunc(
          BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
          true
        )
      ).toBeTruthy();
    }
  });
  it("Test all allowed screens", () => {
    screenWhiteList.forEach(screen => {
      expect(
        isAllowedSnapshotCurrentScreen.resultFunc(screen, false)
      ).toBeTruthy();
      expect(
        isAllowedSnapshotCurrentScreen.resultFunc(screen, true)
      ).toBeTruthy();
    });
  });
  it("Test re-computations only when store interesting part changes", () => {
    // eslint-disable-next-line
    let globalState: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeFalsy();
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeFalsy();
    // with the same state, only one computation is expected
    expect(isAllowedSnapshotCurrentScreen.recomputations()).toBe(1);
    globalState = appReducer(globalState, setDebugModeEnabled(false));
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeFalsy();
    // with a change of state but the same values, no new computation are expected
    expect(isAllowedSnapshotCurrentScreen.recomputations()).toBe(1);
    globalState = appReducer(globalState, setDebugModeEnabled(true));
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeTruthy();
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeTruthy();
    // with a change of state and change in the interested values, a new computation is expected
    expect(isAllowedSnapshotCurrentScreen.recomputations()).toBe(2);
    globalState = appReducer(globalState, applicationChangeState("background"));
    expect(isAllowedSnapshotCurrentScreen(globalState)).toBeTruthy();
    // with a change of state but not in the interested part, no new computation are expected
    expect(isAllowedSnapshotCurrentScreen.recomputations()).toBe(2);

    if (bonusVacanzeEnabled) {
      globalState = appReducer(
        globalState,
        navigateToBonusActivationCompleted()
      );
      expect(isAllowedSnapshotCurrentScreen(globalState)).toBeTruthy();
      // with a change in navigation, a new computation is expected
      expect(isAllowedSnapshotCurrentScreen.recomputations()).toBe(3);
    }
  });
});
