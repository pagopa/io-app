import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  ITW_MAX_OFFLINE_ACCESS_COUNTER,
  ItwSecurePreferencesState
} from "../securePreferences";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../actions/securePreferences";
import { reproduceSequence } from "../../../../../../utils/tests";

describe("IT Wallet secure preferences reducer", () => {
  it("should return the initial state", () => {
    const INITIAL_STATE: ItwSecurePreferencesState = {
      offlineAccessCounter: 0
    };

    const targetSate = appReducer(undefined, applicationChangeState("active"));

    expect(targetSate.features.itWallet.securePreferences).toEqual(
      INITIAL_STATE
    );
  });
  it("should increment the offline access counter", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwOfflineAccessCounterUp()
    ]);

    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(1);
  });
  it("should not increment the offline access counter beyond the maximum limit", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp()
    ]);
    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(ITW_MAX_OFFLINE_ACCESS_COUNTER);
  });
  it("should reset the offline access counter", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterUp(),
      itwOfflineAccessCounterReset()
    ]);

    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(0);
  });
});
