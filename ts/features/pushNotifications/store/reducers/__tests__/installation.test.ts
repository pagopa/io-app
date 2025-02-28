import { GlobalState } from "../../../../../store/reducers/types";
import { generateTokenRegistrationTime } from "../../../utils";
import {
  canSkipTokenRegistrationSelector,
  InstallationState,
  notificationsInstallationSelector,
  TokenRegistrationResendDelay
} from "../installation";

describe("installation", () => {
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
