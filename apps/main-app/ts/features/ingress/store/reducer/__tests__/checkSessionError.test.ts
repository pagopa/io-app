import { checkCurrentSession } from "../../../../authentication/common/store/actions";
import {
  ingressScreenReducer,
  IngressScreenState,
  initialIngressScreenState
} from "../index";

describe("ingressScreenReducer - checkSession", () => {
  it("should handle checkCurrentSession.request", () => {
    const state: IngressScreenState = {
      ...initialIngressScreenState,
      checkSession: { hasError: true }
    };
    const action = checkCurrentSession.request();
    const result = ingressScreenReducer(state, action);

    expect(result.checkSession).toEqual({ hasError: false });
    expect(result.isBlockingScreen).toBe(false);
  });

  it("should handle checkCurrentSession.success", () => {
    const state: IngressScreenState = {
      ...initialIngressScreenState,
      checkSession: { hasError: true }
    };
    const action = checkCurrentSession.success({ isSessionValid: true });
    const result = ingressScreenReducer(state, action);

    expect(result.checkSession).toEqual({ hasError: false });
  });

  it("should handle checkCurrentSession.failure", () => {
    const state: IngressScreenState = {
      ...initialIngressScreenState,
      checkSession: { hasError: false }
    };
    const error = new Error("Session check failed");
    const action = checkCurrentSession.failure(error);
    const result = ingressScreenReducer(state, action);

    expect(result.checkSession).toEqual({ hasError: true });
  });

  it("should have correct initial state", () => {
    const result = ingressScreenReducer(undefined, {} as any);
    expect(result.checkSession).toEqual({ hasError: false });
  });
});
