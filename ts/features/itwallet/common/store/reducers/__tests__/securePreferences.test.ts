import { pipe } from "fp-ts/lib/function";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
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

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

describe("IT Wallet secure preferences reducer", () => {
  it("should return the initial state", () => {
    const INITIAL_STATE: ItwSecurePreferencesState = {
      offlineAccessCounter: 0
    };

    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active"))
    );

    expect(targetSate.features.itWallet.securePreferences).toEqual(
      INITIAL_STATE
    );
  });
  it("should increment the offline access counter", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwOfflineAccessCounterUp())
    );

    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(1);
  });
  it("should not increment the offline access counter beyond the maximum limit", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp())
    );
    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(ITW_MAX_OFFLINE_ACCESS_COUNTER);
  });
  it("should reset the offline access counter", () => {
    const targetSate = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterUp()),
      curriedAppReducer(itwOfflineAccessCounterReset())
    );

    expect(
      targetSate.features.itWallet.securePreferences.offlineAccessCounter
    ).toEqual(0);
  });
});
