import { createStore } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore } from "redux-persist";
import {
  appearanceSettingsReducerPersistor,
  appearanceSettingsReducerInitialState,
  AppearanceSettingsState
} from "..";
import { differentProfileLoggedIn } from "../../../../../store/actions/crossSessions";
import { setShowAppearanceSettingsBanner } from "../../actions";

const defaultValue = {
  showAppearanceBanner: false,
  _persist: { version: 0, rehydrated: true }
};

describe("appearanceSettingsReducer", () => {
  it("should return the initial state", () => {
    const state = appearanceSettingsReducerPersistor(undefined, {} as any);
    expect(state).toStrictEqual(appearanceSettingsReducerInitialState);
  });

  it("should handle setShowAppearanceSettingsBanner action", () => {
    const state = appearanceSettingsReducerPersistor(
      undefined,
      setShowAppearanceSettingsBanner(false)
    );
    expect(state).toStrictEqual({ showAppearanceBanner: false });
  });

  it("should handle differentProfileLoggedIn action (reset state)", () => {
    const state = appearanceSettingsReducerPersistor(
      defaultValue,
      differentProfileLoggedIn()
    );
    expect(state).toStrictEqual(appearanceSettingsReducerInitialState);
  });
});

describe("appearanceSettingsReducerPersistor", () => {
  it("should persist and rehydrate state", async () => {
    const store = createStore(appearanceSettingsReducerPersistor);
    persistStore(store);

    store.dispatch(setShowAppearanceSettingsBanner(false));
    expect(store.getState()).toStrictEqual(defaultValue);

    await AsyncStorage.setItem(
      "persist:appearanceSettings",
      JSON.stringify(appearanceSettingsReducerInitialState)
    );

    const rehydratedState: AppearanceSettingsState = JSON.parse(
      (await AsyncStorage.getItem("persist:appearanceSettings")) || "{}"
    );

    expect(rehydratedState).toStrictEqual(
      appearanceSettingsReducerInitialState
    );
  });
});
