import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ItwSecurePreferencesState } from "../securePreferences";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp,
  itwAvailableCredentialsCounterReset,
  itwAvailableCredentialsCounterUp
} from "../../actions/securePreferences";
import { reproduceSequence } from "../../../../../../utils/tests";

describe("IT Wallet secure preferences reducer", () => {
  it("should return the initial state", () => {
    const INITIAL_STATE: ItwSecurePreferencesState = {
      offlineAccessCounter: 0,
      availableCredentialsCounter: 0
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
  it("should increment the available credentials counter", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwAvailableCredentialsCounterUp()
    ]);

    expect(
      targetSate.features.itWallet.securePreferences.availableCredentialsCounter
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
    ).toEqual(6);
  });
  it("should not increment the available credentials counter beyond the maximum limit", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterUp()
    ]);
    expect(
      targetSate.features.itWallet.securePreferences.availableCredentialsCounter
    ).toEqual(5);
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
  it("should reset the available credentials counter", () => {
    const targetSate = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterUp(),
      itwAvailableCredentialsCounterReset()
    ]);

    expect(
      targetSate.features.itWallet.securePreferences.availableCredentialsCounter
    ).toEqual(0);
  });
});
