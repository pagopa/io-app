import { applicationChangeState } from "../../../../../store/actions/application";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../../../../store/actions/authentication";
import { clearCache } from "../../../../../store/actions/profile";
import { GlobalState } from "../../../../../store/reducers/types";
import * as utils from "../../../utils";
import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../../actions/installation";
import {
  canSkipTokenRegistrationSelector,
  generateInitialState,
  installationReducer,
  InstallationState,
  notificationsInstallationSelector,
  TokenRegistrationResendDelay
} from "../installation";

describe("installation", () => {
  describe("TokenRegistrationResendDelay", () => {
    it("should match expected value", () => {
      expect(TokenRegistrationResendDelay).toBe(86400000);
    });
  });
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
  describe("installationReducer", () => {
    it("should return initial state upon undefined state parameter and unrelated action", () => {
      const reducerState = installationReducer(
        undefined,
        applicationChangeState("active")
      );
      expect(reducerState.id).toBeDefined();
      expect(reducerState.token).toBeUndefined();
      expect(reducerState.registeredToken).toBeUndefined();
      expect(reducerState.tokenStatus).toEqual({ status: "unsent" });
    });
    it("should match expected values after receiving 'newPushNotificationsToken'", () => {
      jest.spyOn(utils, "generateTokenRegistrationTime").mockReturnValue(123);
      const token = "870319107729818332571280539800";
      const initialState = generateInitialState();
      const reducerState = installationReducer(
        initialState,
        newPushNotificationsToken(token)
      );
      expect(reducerState.id).toBeDefined();
      expect(reducerState.token).toBe(token);
      expect(reducerState.registeredToken).toBeUndefined();
      expect(reducerState.tokenStatus).toEqual({
        status: "unsent"
      });
    });
    it("should match expected values after receiving 'pushNotificationsTokenUploaded', when the token status is 'unsent'", () => {
      jest.spyOn(utils, "generateTokenRegistrationTime").mockReturnValue(123);
      const token = "870319107729818332571280539800";
      const iniitalState = installationReducer(
        generateInitialState(),
        newPushNotificationsToken(token)
      );
      const reducerState = installationReducer(
        iniitalState,
        pushNotificationsTokenUploaded(token)
      );
      expect(reducerState.id).toBeDefined();
      expect(reducerState.token).toBe(token);
      expect(reducerState.registeredToken).toBe(token);
      expect(reducerState.tokenStatus).toEqual({
        status: "sentUnconfirmed",
        date: 123
      });
    });
    it("should match expected values after receiving 'pushNotificationsTokenUploaded', when the token status is already 'sentUnconfirmed'", () => {
      const token = "870319107729818332571280539800";
      const initialState: InstallationState = {
        ...generateInitialState(),
        token,
        registeredToken: token,
        tokenStatus: {
          status: "sentUnconfirmed",
          date: 123
        }
      };
      const reducerState = installationReducer(
        initialState,
        pushNotificationsTokenUploaded(token)
      );
      expect(reducerState.id).toBeDefined();
      expect(reducerState.token).toBe(token);
      expect(reducerState.registeredToken).toBe(token);
      expect(reducerState.tokenStatus).toEqual({
        status: "sentConfirmed"
      });
    });
    [
      sessionExpired(),
      sessionInvalid(),
      logoutRequest({ withApiCall: false }),
      logoutRequest({ withApiCall: true }),
      clearCache()
    ].forEach(action => {
      it(`should remove registeredToken and reset the tokenStatus when receiving action '${action.type}'`, () => {
        const token = "870319107729818332571280539800";
        const initialState: InstallationState = {
          id: "whateverItIsNotUsedAnymore",
          token,
          registeredToken: "870319107729818332571280539800",
          tokenStatus: {
            status: "sentConfirmed"
          }
        };
        const reducerState = installationReducer(initialState, action);
        expect(reducerState.id).toBeDefined();
        expect(reducerState.token).toBe(token);
        expect(reducerState.registeredToken).toBeUndefined();
        expect(reducerState.tokenStatus).toEqual({
          status: "unsent"
        });
      });
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
                utils.generateTokenRegistrationTime() -
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
                utils.generateTokenRegistrationTime() -
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
