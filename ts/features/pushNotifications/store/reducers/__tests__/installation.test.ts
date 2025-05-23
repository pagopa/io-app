import { applicationChangeState } from "../../../../../store/actions/application";
import {
  logoutRequest,
  sessionExpired,
  sessionInvalid
} from "../../../../authentication/common/store/actions";
import { clearCache } from "../../../../settings/common/store/actions";
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("installationReducer", () => {
    // Reducer states are not dynamically generated in order
    // to ease the reader's comprehension of the test cases
    const oneDayPlusOneSecond = 24 * 60 * 60 * 1000 + 1000;
    const reducerCombinations: ReadonlyArray<InstallationState> = [
      // This is the initial state
      {
        id: "",
        token: undefined,
        registeredToken: undefined,
        tokenStatus: { status: "unsent" }
      },
      // Invalid state: missing token will never be sentUnconfirmed
      {
        id: "",
        token: undefined,
        registeredToken: undefined,
        tokenStatus: { status: "sentUnconfirmed", date: oneDayPlusOneSecond }
      },
      // Invalid state: missing token will never be sentConfirmed
      {
        id: "",
        token: undefined,
        registeredToken: undefined,
        tokenStatus: { status: "sentConfirmed" }
      },
      // Invalid state: there cannot be a registeredToken without a token
      {
        id: "",
        token: undefined,
        registeredToken: "token2",
        tokenStatus: { status: "unsent" }
      },
      // Invalid state: there cannot be a registeredToken without a token
      {
        id: "",
        token: undefined,
        registeredToken: "token2",
        tokenStatus: { status: "sentUnconfirmed", date: oneDayPlusOneSecond }
      },
      // Invalid state: there cannot be a registeredToken without a token
      {
        id: "",
        token: undefined,
        registeredToken: "token2",
        tokenStatus: { status: "sentConfirmed" }
      },
      // This is the state upon receiving a token for the first time
      {
        id: "",
        token: "token1",
        registeredToken: undefined,
        tokenStatus: { status: "unsent" }
      },
      // Invalid state: registeredToken cannot be undefined with status sentUnconfirmed
      {
        id: "",
        token: "token1",
        registeredToken: undefined,
        tokenStatus: { status: "sentUnconfirmed", date: oneDayPlusOneSecond }
      },
      // Invalid state: registeredToken cannot be undefined with status sentConfirmed
      {
        id: "",
        token: "token1",
        registeredToken: undefined,
        tokenStatus: { status: "sentConfirmed" }
      },
      // Invalid state: tokenStatus cannot be unsent with both token and registeredToken defined
      {
        id: "",
        token: "token1",
        registeredToken: "token2",
        tokenStatus: { status: "unsent" }
      },
      // Invalid state: tokenStatus cannot be sentUnconfirmed with different value between token and registeredToken
      {
        id: "",
        token: "token1",
        registeredToken: "token2",
        tokenStatus: { status: "sentUnconfirmed", date: oneDayPlusOneSecond }
      },
      // Invalid state: tokenStatus cannot be sentConfirmed with different value between token and registeredToken
      {
        id: "",
        token: "token1",
        registeredToken: "token2",
        tokenStatus: { status: "sentConfirmed" }
      },
      // Invalid state: token and registerdToken cannot be the same with status unsent
      {
        id: "",
        token: "token1",
        registeredToken: "token1",
        tokenStatus: { status: "unsent" }
      },
      // This is the state upon having successfully registered the token for the first time
      {
        id: "",
        token: "token1",
        registeredToken: "token1",
        tokenStatus: { status: "sentUnconfirmed", date: oneDayPlusOneSecond }
      },
      // This is the state upon having successfully registered again the token, after more than one day
      {
        id: "",
        token: "token1",
        registeredToken: "token1",
        tokenStatus: { status: "sentConfirmed" }
      }
    ];
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
    reducerCombinations.forEach((inputState, index) => {
      it(`should match expected state when 'newPushNotificationsToken' is received for the same 'registeredToken' and reducer input state at ${index}`, () => {
        const reducerState = installationReducer(
          inputState,
          newPushNotificationsToken("token2")
        );
        if (inputState.registeredToken === "token2") {
          // If the registeredToken matches the action's token, then
          // 'tokenStatus' must be preserved and 'token' must match the
          // 'registeredToken', regardless of the inputState's token
          expect(reducerState).toEqual({
            ...inputState,
            token: "token2"
          });
        } else {
          // It the registeredToken is different from the action's token,
          // then 'tokenStatus' must be unsent and 'registeredToken' is
          // undefined
          expect(reducerState).toEqual({
            id: inputState.id,
            token: "token2",
            registeredToken: undefined,
            tokenStatus: { status: "unsent" }
          });
        }
      });
    });
    reducerCombinations.forEach((inputState, index) => {
      it(`should match expected state when 'newPushNotificationsToken' is received for a different 'registeredToken' and reducer input state at ${index}`, () => {
        const reducerState = installationReducer(
          inputState,
          newPushNotificationsToken("token3")
        );
        expect(reducerState).toEqual({
          id: inputState.id,
          token: "token3",
          registeredToken: undefined,
          tokenStatus: { status: "unsent" }
        });
      });
    });
    reducerCombinations.forEach((inputState, index) => {
      it(`should match expected state when 'pushNotificationsTokenUploaded' is received for the same 'token' and reducer input state at ${index}`, () => {
        jest
          .spyOn(utils, "generateTokenRegistrationTime")
          .mockReturnValue(2 * oneDayPlusOneSecond);
        const reducerState = installationReducer(
          inputState,
          pushNotificationsTokenUploaded("token1")
        );
        const expectedRegisteredToken =
          inputState.token === "token1" ? "token1" : undefined;
        const expectedTokenStatus =
          inputState.token === "token1"
            ? inputState.tokenStatus.status === "unsent"
              ? {
                  status: "sentUnconfirmed",
                  date: 2 * oneDayPlusOneSecond
                }
              : { status: "sentConfirmed" }
            : { status: "unsent" };
        expect(reducerState).toEqual({
          ...inputState,
          registeredToken: expectedRegisteredToken,
          tokenStatus: expectedTokenStatus
        });
      });
    });
    reducerCombinations.forEach((inputState, index) => {
      it(`should match expected state when 'pushNotificationsTokenUploaded' is received for a different 'token' and reducer input state at ${index}`, () => {
        const reducerState = installationReducer(
          inputState,
          pushNotificationsTokenUploaded("token2")
        );
        expect(reducerState).toEqual({
          ...inputState,
          registeredToken: undefined,
          tokenStatus: { status: "unsent" }
        });
      });
    });
    [
      sessionExpired(),
      sessionInvalid(),
      logoutRequest({ withApiCall: false }),
      logoutRequest({ withApiCall: true }),
      clearCache()
    ].forEach(accessoryAction =>
      ["token1", "token2"].forEach(inputToken =>
        reducerCombinations.forEach((inputState, index) =>
          it(`should match expected state when action '${
            accessoryAction.type
          }'${
            accessoryAction.type === "LOGOUT_REQUEST" ? " with payload " : ""
          }${
            accessoryAction.type === "LOGOUT_REQUEST"
              ? accessoryAction.payload.withApiCall
              : ""
          } is received, ${
            inputToken === "token1" ? "same" : "different"
          } token and reducer input state at ${index}`, () => {
            const reducerState = installationReducer(
              inputState,
              accessoryAction
            );
            expect(reducerState).toEqual({
              ...inputState,
              registeredToken: undefined,
              tokenStatus: { status: "unsent" }
            });
          })
        )
      )
    );
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
