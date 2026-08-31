import * as O from "fp-ts/lib/Option";
import MockDate from "mockdate";

import { isSessionExpiringSelector } from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { isFastLoginEnabledSelector } from "../../../../fastLogin/store/selectors";

jest.mock("../../../../fastLogin/store/selectors", () => ({
  isFastLoginEnabledSelector: jest.fn()
}));

const mockIsFastLoginEnabledSelector =
  isFastLoginEnabledSelector as unknown as jest.Mock;

const getState = (
  expirationDate: Date | undefined,
  threshold: {
    fastLogin?: number;
    standardLogin?: number;
  },
  remoteConfig: GlobalState["remoteConfig"] = O.some({
    loginConfig: { notifyExpirationThreshold: threshold }
  } as any)
) =>
  ({
    authentication: {
      kind: "LoggedInWithSessionInfo",
      idp: { entityId: "idp1", isTestIdp: false },
      sessionToken: "abc",
      sessionInfo: { expirationDate }
    },
    remoteConfig
  }) as unknown as GlobalState;

describe("isSessionExpiringSelector", () => {
  beforeEach(() => {
    MockDate.set(new Date(2025, 5, 10));
    mockIsFastLoginEnabledSelector.mockReturnValue(false);
  });

  it("should return false when there is no session info", () => {
    const state = {
      authentication: { kind: "LoggedOut" },
      remoteConfig: O.some({
        loginConfig: { notifyExpirationThreshold: { standardLogin: 5 } }
      })
    } as unknown as GlobalState;
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should return false when the session info has no expiration date", () => {
    const state = getState(undefined, { standardLogin: 5 });
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should return false when the remote config is missing", () => {
    const state = getState(new Date(2025, 5, 12), { standardLogin: 5 }, O.none);
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should return false when the notify threshold for the current login type is missing", () => {
    const state = getState(new Date(2025, 5, 12), {});
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should return false when the threshold is negative", () => {
    const state = getState(new Date(2025, 5, 11), { standardLogin: -1 });
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should return true when the session expires within the standard login threshold", () => {
    const state = getState(new Date(2025, 5, 12), { standardLogin: 5 });
    expect(isSessionExpiringSelector(state)).toBe(true);
  });

  it("should return false when the session expires after the standard login threshold", () => {
    const state = getState(new Date(2025, 5, 20), { standardLogin: 5 });
    expect(isSessionExpiringSelector(state)).toBe(false);
  });

  it("should use the fast login threshold when fast login is enabled", () => {
    mockIsFastLoginEnabledSelector.mockReturnValue(true);
    const state = getState(new Date(2025, 5, 12), {
      standardLogin: 0,
      fastLogin: 5
    });
    expect(isSessionExpiringSelector(state)).toBe(true);
  });

  it("should return false when fast login is enabled but only the standard login threshold is set", () => {
    mockIsFastLoginEnabledSelector.mockReturnValue(true);
    const state = getState(new Date(2025, 5, 12), { standardLogin: 5 });
    expect(isSessionExpiringSelector(state)).toBe(false);
  });
});
