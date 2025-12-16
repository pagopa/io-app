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
  idpSelector
} from "../selectors";
import { format } from "../../../../../utils/dates";
import { GlobalState } from "../../../../../store/reducers/types";
import { isLogoutRequested } from "../utils/guards";

const mockIdp = { entityId: "idp1", isTestIdp: false };

const createLoggedInState = (): GlobalState =>
  ({
    authentication: {
      kind: "LoggedIn",
      idp: { entityId: "idp1", isTestIdp: false },
      sessionToken: "abc"
    }
  } as any);

const createLoggedOutWithIdpState = (): GlobalState =>
  ({
    authentication: {
      kind: "LoggedOutWithIdp",
      idp: { entityId: "idp1", isTestIdp: false }
    }
  } as any);

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
  } as any);

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
