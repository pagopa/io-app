import * as O from "fp-ts/lib/Option";
import {
  authenticationStateSelector,
  loggedOutWithIdpAuthSelector,
  fimsTokenSelector,
  sessionInfoSelector,
  formattedExpirationDateSelector,
  zendeskTokenSelector,
  walletTokenSelector,
  bpdTokenSelector,
  selectedIdentityProviderSelector,
  idpSelector,
  extractSpidLevel,
  spidLevelFromSessionInfoSelector
} from "../selectors";
import { format } from "../../../../../utils/dates";
import { GlobalState } from "../../../../../store/reducers/types";
import { isLogoutRequested } from "../utils/guards";
import { SpidLevelEnum } from "../../../../../../definitions/session_manager/SpidLevel";

const mockIdp = { entityId: "idp1", isTestIdp: false };

const createLoggedInState = (): GlobalState =>
  ({
    authentication: {
      kind: "LoggedIn",
      idp: { entityId: "idp1", isTestIdp: false },
      sessionToken: "abc"
    }
  }) as any;

const createLoggedOutWithIdpState = (): GlobalState =>
  ({
    authentication: {
      kind: "LoggedOutWithIdp",
      idp: { entityId: "idp1", isTestIdp: false }
    }
  }) as any;

const createLoggedInWithSessionInfoState = (): GlobalState =>
  ({
    authentication: {
      kind: "LoggedInWithSessionInfo",
      idp: { entityId: "idp1", isTestIdp: false },
      sessionToken: "abc",
      sessionInfo: {
        expirationDate: new Date("2025-06-10"),
        fimsToken: "fims",
        zendeskToken: "zendesk",
        walletToken: "wallet",
        bpdToken: "bpd"
      }
    }
  }) as any;

describe("authentication selectors", () => {
  it("should return authentication state", () => {
    const state = createLoggedInState();
    expect(authenticationStateSelector(state)).toEqual(state.authentication);
  });

  it("should return undefined from loggedOutWithIdpAuthSelector if not logged out with Idp", () => {
    const state = createLoggedInState();
    expect(loggedOutWithIdpAuthSelector(state)).toBeUndefined();
  });

  it("should return true if kind is LogoutRequested", () => {
    const state = { authentication: { kind: "LogoutRequested" } } as Pick<
      GlobalState,
      "authentication"
    >;
    expect(isLogoutRequested(state.authentication)).toBe(true);
  });

  it("should return fims token if logged in with session info", () => {
    const state = createLoggedInWithSessionInfoState();
    expect(fimsTokenSelector(state)).toBe("fims");
  });

  it("should return session info as Option if logged in with session info", () => {
    const state = createLoggedInWithSessionInfoState();
    expect(sessionInfoSelector(state)).toEqual(
      O.some((state.authentication as any).sessionInfo)
    );
  });

  it("should return formatted expiration date", () => {
    const date = new Date("2025-06-10");
    const state = createLoggedInWithSessionInfoState();
    expect(formattedExpirationDateSelector(state)).toBe(format(date, "D MMMM"));
  });

  it("should return 'N/A' if no expirationDate", () => {
    const state = {
      authentication: {
        kind: "LoggedInWithSessionInfo",
        idp: { entityId: "idp1", isTestIdp: false },
        sessionToken: "abc",
        sessionInfo: {}
      }
    } as any;
    expect(formattedExpirationDateSelector(state)).toBe("N/A");
  });

  it("should return other tokens if available", () => {
    const state = createLoggedInWithSessionInfoState();
    expect(zendeskTokenSelector(state)).toBe("zendesk");
    expect(walletTokenSelector(state)).toBe("wallet");
    expect(bpdTokenSelector(state)).toBe("bpd");
  });

  it("should return selected idp if logged out with idp", () => {
    const state = createLoggedOutWithIdpState();
    expect(selectedIdentityProviderSelector(state)).toEqual(mockIdp);
  });

  it("should return Option.none if logged out without idp", () => {
    const state = {
      authentication: { kind: "LoggedOutWithoutIdp" }
    } as any;
    expect(idpSelector(state)).toEqual(O.none);
  });

  it("should return Option.some(idp) if logged out with idp", () => {
    const state = createLoggedOutWithIdpState();
    expect(idpSelector(state)).toEqual(O.some(mockIdp));
  });
});

describe("extractSpidLevel", () => {
  it("should return 'L1' when spidLevel contains 'L1'", () => {
    expect(
      extractSpidLevel(SpidLevelEnum["https://www.spid.gov.it/SpidL1"])
    ).toBe("L1");
  });

  it("should return 'L2' when spidLevel contains 'L2'", () => {
    expect(
      extractSpidLevel(SpidLevelEnum["https://www.spid.gov.it/SpidL2"])
    ).toBe("L2");
  });

  it("should return 'L3' when spidLevel contains 'L3'", () => {
    expect(
      extractSpidLevel(SpidLevelEnum["https://www.spid.gov.it/SpidL3"])
    ).toBe("L3");
  });

  it("should return undefined when spidLevel is undefined", () => {
    expect(extractSpidLevel(undefined)).toBeUndefined();
  });

  it("should return undefined when spidLevel does not contain valid level", () => {
    expect(
      extractSpidLevel("https://www.spid.gov.it/Invalid" as any)
    ).toBeUndefined();
  });
});

describe("spidLevelFromSessionInfoSelector", () => {
  it("should return 'L1' when logged in with session info containing SpidL1", () => {
    const state = {
      authentication: {
        kind: "LoggedInWithSessionInfo",
        idp: { entityId: "idp1", isTestIdp: false },
        sessionToken: "abc",
        sessionInfo: {
          spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL1"]
        }
      }
    } as any;
    expect(spidLevelFromSessionInfoSelector(state)).toBe("L1");
  });

  it("should return 'L2' when logged in with session info containing SpidL2", () => {
    const state = {
      authentication: {
        kind: "LoggedInWithSessionInfo",
        idp: { entityId: "idp1", isTestIdp: false },
        sessionToken: "abc",
        sessionInfo: {
          spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"]
        }
      }
    } as any;
    expect(spidLevelFromSessionInfoSelector(state)).toBe("L2");
  });

  it("should return 'L3' when logged in with session info containing SpidL3", () => {
    const state = {
      authentication: {
        kind: "LoggedInWithSessionInfo",
        idp: { entityId: "idp1", isTestIdp: false },
        sessionToken: "abc",
        sessionInfo: {
          spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL3"]
        }
      }
    } as any;
    expect(spidLevelFromSessionInfoSelector(state)).toBe("L3");
  });

  it("should return undefined when logged in with session info without spidLevel", () => {
    const state = createLoggedInWithSessionInfoState();
    expect(spidLevelFromSessionInfoSelector(state)).toBeUndefined();
  });

  it("should return undefined when not logged in with session info", () => {
    const state = createLoggedInState();
    expect(spidLevelFromSessionInfoSelector(state)).toBeUndefined();
  });

  it("should return undefined when logged out", () => {
    const state = createLoggedOutWithIdpState();
    expect(spidLevelFromSessionInfoSelector(state)).toBeUndefined();
  });
});
