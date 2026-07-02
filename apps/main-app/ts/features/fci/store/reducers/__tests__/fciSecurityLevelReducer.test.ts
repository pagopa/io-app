import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { fciL3LocalFlag } from "../../actions";
import { isFciSecurityLevelCheckEnabledSelector } from "../fciSecurityLevelReducer";

describe("FciSecurityLevelReducer", () => {
  it("should have an initialState with localFeatureFlag equal to false", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(
      globalState.features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });
  it("should have localFeatureFlag equal to true if the fciL3LocalFlag is dispatched with true as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
  });
  it("should have localFeatureFlag equal to false if the fciL3LocalFlag is dispatched with false as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(false));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });
  it("should change localFeatureFlag from false to true if the initialState is false and fciL3LocalFlag is dispatched with true as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
  });
  it("should change localFeatureFlag from true to false if the initialState is true and fciL3LocalFlag is dispatched with false as payload", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(fciL3LocalFlag(true));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(true);
    store.dispatch(fciL3LocalFlag(false));
    expect(
      store.getState().features.fci.securityLevel.localFeatureFlag
    ).toStrictEqual(false);
  });

  describe("isFciSecurityLevelCheckEnabledSelector", () => {
    it.each([
      {
        name: "both local and remote flags are false",
        localFlag: false,
        remoteConfig: O.some({
          fci: {
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            },
            security_level_check: {
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            }
          }
        }),
        expected: false
      },
      {
        name: "local flag is true and remote flag is false",
        localFlag: true,
        remoteConfig: O.some({
          fci: {
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            },
            security_level_check: {
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            }
          }
        }),
        expected: true
      },
      {
        name: "local flag is false and remote flag is true",
        localFlag: false,
        remoteConfig: O.some({
          fci: {
            min_app_version: {
              android: "1.0.0.0",
              ios: "1.0.0.0"
            },
            security_level_check: {
              min_app_version: {
                android: "1.0.0.0",
                ios: "1.0.0.0"
              }
            }
          }
        }),
        expected: true
      },
      {
        name: "both local and remote flags are true",
        localFlag: true,
        remoteConfig: O.some({
          fci: {
            min_app_version: {
              android: "1.0.0.0",
              ios: "1.0.0.0"
            },
            security_level_check: {
              min_app_version: {
                android: "1.0.0.0",
                ios: "1.0.0.0"
              }
            }
          }
        }),
        expected: true
      },
      {
        name: "local flag is false and remoteConfig is none",
        localFlag: false,
        remoteConfig: O.none,
        expected: false
      },
      {
        name: "local flag is true and remoteConfig is none",
        localFlag: true,
        remoteConfig: O.none,
        expected: true
      },
      {
        name: "local flag is false and remote config is empty",
        localFlag: false,
        remoteConfig: O.some({}),
        expected: false
      }
    ])(
      "should return $expected when $name",
      ({ localFlag, remoteConfig, expected }) => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const store = createStore(appReducer, globalState as any);
        store.dispatch(fciL3LocalFlag(localFlag));

        const state = {
          ...store.getState(),
          remoteConfig
        } as GlobalState;

        const result = isFciSecurityLevelCheckEnabledSelector(state);
        expect(result).toBe(expected);
      }
    );
  });
});
