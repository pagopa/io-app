import { GlobalState } from "../../../../../store/reducers/types";
import { generateTokenRegistrationTime } from "../../../utils";
import {
  canSkipTokenRegistrationSelector,
  generateInitialState,
  InstallationState,
  notificationsInstallationSelector,
  TokenRegistrationResendDelay
} from "../installation";

describe("installation", () => {
  describe("generateInitialState", () => {
    it("should generate expected initial state", () => {
      const initialState = generateInitialState();
      expect(initialState.id).toBeDefined();
      expect(initialState.token).toBeUndefined();
      expect(initialState.registeredToken).toBeUndefined();
      expect(initialState.tokenStatus).toEqual({ status: "unsent" });

      const anotherInitialState = generateInitialState();
      expect(anotherInitialState.id).toBeDefined();
      expect(initialState.id).not.toEqual(anotherInitialState.id);
    });
  });
  describe("notificationsInstallationSelector", () => {
    it("should return the installation state", () => {
      const installationState: InstallationState = {
        id: "thisIsReallyNotUsed",
        tokenStatus: { status: "unsent" }
      };
      const state = {
        notifications: {
          installation: installationState
        }
      } as GlobalState;
      const output = notificationsInstallationSelector(state);
      expect(output).toBe(installationState);
    });
  });
  describe("canSkipTokenRegistrationSelector", () => {
    it("should return false for 'tokenStatus' set to 'unsent'", () => {
      const state = {
        notifications: {
          installation: {
            id: "thisIsReallyNotUsed",
            tokenStatus: { status: "unsent" }
          }
        }
      } as GlobalState;
      const output = canSkipTokenRegistrationSelector(state);
      expect(output).toBe(false);
    });
    it("should return true for 'tokenStatus' set to 'sentUnconfirmed' but less than one day ago", () => {
      const state = {
        notifications: {
          installation: {
            id: "thisIsReallyNotUsed",
            tokenStatus: {
              status: "sentUnconfirmed",
              date:
                generateTokenRegistrationTime() -
                TokenRegistrationResendDelay / 2
            }
          }
        }
      } as GlobalState;
      const output = canSkipTokenRegistrationSelector(state);
      expect(output).toBe(true);
    });
    it("should return false for 'tokenStatus' set to 'sentUnconfirmed' and more than one day ago", () => {
      const state = {
        notifications: {
          installation: {
            id: "thisIsReallyNotUsed",
            tokenStatus: {
              status: "sentUnconfirmed",
              date:
                generateTokenRegistrationTime() -
                2 * TokenRegistrationResendDelay
            }
          }
        }
      } as GlobalState;
      const output = canSkipTokenRegistrationSelector(state);
      expect(output).toBe(false);
    });
    it("should return true for 'tokenStatus' set to 'sentConfirmed'", () => {
      const state = {
        notifications: {
          installation: {
            id: "thisIsReallyNotUsed",
            tokenStatus: { status: "sentConfirmed" }
          }
        }
      } as GlobalState;
      const output = canSkipTokenRegistrationSelector(state);
      expect(output).toBe(true);
    });
  });
});
