import { checkSessionErrorSelector } from "../index";
import { GlobalState } from "../../../../../store/reducers/types";

describe("checkSessionErrorSelector", () => {
  it("should select hasError from ingress checkSession state", () => {
    const mockState = {
      features: {
        ingress: {
          isBlockingScreen: false,
          checkSession: {
            hasError: true
          }
        }
      }
    } as GlobalState;

    const result = checkSessionErrorSelector(mockState);
    expect(result).toBe(true);
  });

  it("should return false when hasError is false", () => {
    const mockState = {
      features: {
        ingress: {
          isBlockingScreen: false,
          checkSession: {
            hasError: false
          }
        }
      }
    } as GlobalState;

    const result = checkSessionErrorSelector(mockState);
    expect(result).toBe(false);
  });
});
