import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus";
import {
  clearCurrentSession,
  idpLoginUrlChanged,
  idpSelected,
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
  sessionExpired,
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../../features/authentication/common/store/actions";
import { cieAuthenticationError } from "../../../features/authentication/login/cie/store/actions";
import { loadAvailableBonuses } from "../../../features/bonus/common/store/actions/availableBonusesTypes";
import { SessionToken } from "../../../types/SessionToken";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../../actions/analytics";
import { applicationChangeState } from "../../actions/application";
import { contentMunicipalityLoad } from "../../actions/content";
import {
  profileFirstLogin,
  profileLoadFailure,
  profileLoadRequest,
  profileUpsert,
  removeAccountMotivation,
  RemoveAccountMotivationEnum
} from "../../../features/settings/common/store/actions";
import { profileEmailValidationChanged } from "../../../features/mailCheck/store/actions/profileEmailValidationChange";
import { searchMessagesEnabled } from "../../actions/search";
import {
  deleteUserDataProcessing,
  upsertUserDataProcessing
} from "../../../features/settings/common/store/actions/userDataProcessing";
import { ProfileError } from "../../../features/settings/common/store/types";
import { actionTracking, testable } from "../analytics";
import * as CGNANALYTICS from "../../../features/bonus/cgn/analytics";
import * as SERVICESANALYTICS from "../../../features/services/common/analytics";
import * as CONTENTANALYTICS from "../contentAnalytics";
import * as ZENDESKANALYTICS from "../../../features/zendesk/analytics/index";
import * as FCIANALYTICS from "../../../features/fci/analytics";
import * as MESSAGESANALYTICS from "../../../features/messages/analytics";
import * as FCIREDUCERS from "../../../features/fci/store/reducers/fciEnvironment";
import { Action, MiddlewareAPI } from "../../actions/types";
import { GlobalState } from "../../reducers/types";

// eslint-disable-next-line functional/no-let
let mockIsMixpanelInitialized = true;
const mockMixpanelTrack = jest.fn();
jest.mock("../../../mixpanel", () => ({
  isMixpanelInstanceInitialized: () => mockIsMixpanelInitialized,
  mixpanelTrack: (eventName: string, properties: Record<string, unknown>) =>
    mockMixpanelTrack(eventName, properties)
}));

describe("analytics", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("trackAction", () => {
    mockIsMixpanelInitialized = true;
    it("should call 'mixpanelTrack' for 'applicationChangeState' with proper parameters", () => {
      const action = applicationChangeState("active");

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe("APP_STATE_CHANGE");
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        APPLICATION_STATE_NAME: "active"
      });
    });
    it("should call 'mixpanelTrack' for 'idpSelected' with proper parameters", () => {
      const action = idpSelected({
        id: "An id",
        name: "A name",
        logo: { light: { uri: "" } },
        profileUrl: ""
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        SPID_IDP_ID: "An id",
        SPID_IDP_NAME: "A name"
      });
    });
    it("should call 'mixpanelTrack' for 'idpLoginUrlChanged' with proper parameters", () => {
      const action = idpLoginUrlChanged({ url: "An url" });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        SPID_URL: "An url"
      });
    });

    it("should call 'mixpanelTrack' for 'profileEmailValidationChanged' with proper parameters", () => {
      const action = profileEmailValidationChanged(true);

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        isEmailValidated: true
      });
    });

    it("should call 'mixpanelTrack' for 'upsertUserDataProcessing.failure' with proper parameters", () => {
      const action = upsertUserDataProcessing.failure({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        error: Error("An error")
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toMatchObject({
        reason: "An error"
      });
    });

    it("should call 'mixpanelTrack' for 'logoutFailure' with proper parameters", () => {
      const action = logoutFailure({ error: Error("") });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'cieAuthenticationError' with proper parameters", () => {
      const action = cieAuthenticationError({
        reason: "GENERIC",
        flow: "auth"
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "KO",
        event_type: undefined,
        reason: "GENERIC",
        flow: "auth"
      });
    });

    it("should call 'mixpanelTrack' for 'sessionInformationLoadFailure' with proper parameters", () => {
      const action = sessionInformationLoadFailure(Error(""));

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'profileLoadFailure' with proper parameters", () => {
      const action = profileLoadFailure(Error(""));

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'profileUpsert.failure' with proper parameters", () => {
      const action = profileUpsert.failure(new ProfileError(""));

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'loadAvailableBonuses.failure' with proper parameters", () => {
      const action = loadAvailableBonuses.failure(Error(""));

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'contentMunicipalityLoad.failure' with proper parameters", () => {
      const action = contentMunicipalityLoad.failure({
        error: Error("An error"),
        codiceCatastale: "a code"
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        codice_catastale: "a code",
        reason: "An error"
      });
    });

    it("should call 'mixpanelTrack' for 'upsertUserDataProcessing.success' with proper parameters", () => {
      const action = upsertUserDataProcessing.success({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        status: UserDataProcessingStatusEnum.WIP,
        version: 1
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        choice: "DOWNLOAD",
        status: "WIP",
        version: 1
      });
    });

    it("should call 'mixpanelTrack' for 'loginFailure' with proper parameters", () => {
      const action = loginFailure({
        error: Error("A reason"),
        idp: undefined
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        event_type: "error",
        flow: "auth",
        reason: "A reason",
        idp: undefined
      });
    });

    it("should call 'mixpanelTrack' for 'loginSuccess' with proper parameters", () => {
      const action = loginSuccess({
        token: "" as SessionToken,
        idp: "test"
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        idp: "test"
      });
    });

    it("should call 'mixpanelTrack' for 'clearCurrentSession' with proper parameters", () => {
      const action = clearCurrentSession();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'analyticsAuthenticationStarted' with proper parameters", () => {
      const action = analyticsAuthenticationStarted("auth");

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'analyticsAuthenticationCompleted' with proper parameters", () => {
      const action = analyticsAuthenticationCompleted("auth");

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'sessionInformationLoadSuccess' with proper parameters", () => {
      const action = sessionInformationLoadSuccess({});

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'sessionExpired' with proper parameters", () => {
      const action = sessionExpired();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'sessionInvalid' with proper parameters", () => {
      const action = sessionInvalid();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'logoutSuccess' with proper parameters", () => {
      const action = logoutSuccess();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'profileUpsert.success' with proper parameters", () => {
      const action = profileUpsert.success({
        value: {} as InitializedProfile,
        newValue: {} as InitializedProfile
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'profileLoadRequest' with proper parameters", () => {
      const action = profileLoadRequest();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'searchMessagesEnabled' with proper parameters", () => {
      const action = searchMessagesEnabled(true);

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toBeUndefined();
    });

    it("should call 'mixpanelTrack' for 'profileFirstLogin' with proper parameters", () => {
      const action = profileFirstLogin();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'loadAvailableBonuses.success' with proper parameters", () => {
      const action = loadAvailableBonuses.success([]);

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toBeUndefined();
    });

    it("should call 'mixpanelTrack' for 'loadAvailableBonuses.request' with proper parameters", () => {
      const action = loadAvailableBonuses.request();

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
    });

    it("should call 'mixpanelTrack' for 'deleteUserDataProcessing.request' with proper parameters", () => {
      const action = deleteUserDataProcessing.request(
        UserDataProcessingChoiceEnum.DOWNLOAD
      );

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        choice: "DOWNLOAD"
      });
    });

    it("should call 'mixpanelTrack' for 'removeAccountMotivation' with proper parameters", () => {
      const action = removeAccountMotivation({
        reason: RemoveAccountMotivationEnum.NOT_SAFE
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        reason: "notSafe"
      });
    });

    it("should call 'mixpanelTrack' for 'deleteUserDataProcessing.success' with proper parameters", () => {
      const action = deleteUserDataProcessing.success({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        choice: "DOWNLOAD"
      });
    });

    it("should call 'mixpanelTrack' for 'deleteUserDataProcessing.failure' with proper parameters", () => {
      const action = deleteUserDataProcessing.failure({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        error: Error("A reason")
      });

      testable!.trackAction(action);

      expect(mockMixpanelTrack.mock.calls.length).toBe(1);
      expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(mockMixpanelTrack.mock.calls[0][0]).toBe(action.type);
      expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
        choice: "DOWNLOAD",
        reason: "A reason"
      });
    });
  });
  describe("actionTracking", () => {
    it("should invoke proper tracking functions when mixpanel is initialized", () => {
      mockIsMixpanelInitialized = true;
      const mockedState = {} as GlobalState;
      const mockedMiddlewareAPI = {
        getState: () => mockedState
      } as unknown as MiddlewareAPI;
      const mockedDispatch = <T>(action: T) => action;
      const mockedAction = {} as Action;

      jest
        .spyOn(FCIREDUCERS, "fciEnvironmentSelector")
        .mockImplementation(_state => "test");

      const spyOnMockedCgnAnalytics = jest
        .spyOn(CGNANALYTICS, "default")
        .mockImplementation();
      const spyOnMockedContentAnalytics = jest
        .spyOn(CONTENTANALYTICS, "trackContentAction")
        .mockImplementation();
      const spyOnMockedFCIAnalytics = jest
        .spyOn(FCIANALYTICS, "default")
        .mockImplementation(_env => (_action: Action) => undefined);
      const spyOnMockedMessagesAnalytics = jest
        .spyOn(MESSAGESANALYTICS, "trackMessagesActionsPostDispatch")
        .mockImplementation();
      const spyOnMockedZendeskAnalytics = jest
        .spyOn(ZENDESKANALYTICS, "default")
        .mockImplementation();
      const spyOnMockedServicesAnalytics = jest
        .spyOn(SERVICESANALYTICS, "trackServicesAction")
        .mockImplementation();

      const result =
        actionTracking(mockedMiddlewareAPI)(mockedDispatch)(mockedAction);

      // Unfortunately, there is no way to check that the private method trackAction has been called

      expect(spyOnMockedCgnAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedCgnAnalytics).toHaveBeenCalledWith(mockedAction);

      expect(spyOnMockedContentAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedContentAnalytics).toHaveBeenCalledWith(mockedAction);

      expect(spyOnMockedServicesAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedServicesAnalytics).toHaveBeenCalledWith(mockedAction);

      expect(spyOnMockedZendeskAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedZendeskAnalytics).toHaveBeenCalledWith(mockedAction);

      expect(spyOnMockedFCIAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedFCIAnalytics).toHaveBeenCalledWith("test");

      expect(spyOnMockedMessagesAnalytics).toHaveBeenCalledTimes(1);
      expect(spyOnMockedMessagesAnalytics).toHaveBeenCalledWith(
        mockedAction,
        mockedState
      );

      expect(result).toBe(mockedAction);
    });
    it("should not invoke tracking functions when mixpanel is not initialized", () => {
      mockIsMixpanelInitialized = false;
      const mockedState = {} as GlobalState;
      const mockedMiddlewareAPI = {
        getState: () => mockedState
      } as unknown as MiddlewareAPI;
      const mockedDispatch = <T>(action: T) => action;
      const mockedAction = {} as Action;

      jest
        .spyOn(FCIREDUCERS, "fciEnvironmentSelector")
        .mockImplementation(_state => "test");

      const spyOnMockedCgnAnalytics = jest
        .spyOn(CGNANALYTICS, "default")
        .mockImplementation();
      const spyOnMockedContentAnalytics = jest
        .spyOn(CONTENTANALYTICS, "trackContentAction")
        .mockImplementation();
      const spyOnMockedFCIAnalytics = jest
        .spyOn(FCIANALYTICS, "default")
        .mockImplementation(_env => (_action: Action) => undefined);
      const spyOnMockedMessagesAnalytics = jest
        .spyOn(MESSAGESANALYTICS, "trackMessagesActionsPostDispatch")
        .mockImplementation();
      const spyOnMockedZendeskAnalytics = jest
        .spyOn(ZENDESKANALYTICS, "default")
        .mockImplementation();
      const spyOnMockedServicesAnalytics = jest
        .spyOn(SERVICESANALYTICS, "trackServicesAction")
        .mockImplementation();

      const result =
        actionTracking(mockedMiddlewareAPI)(mockedDispatch)(mockedAction);

      // Unfortunately, there is no way to check that the private method trackAction has not been called

      expect(spyOnMockedCgnAnalytics).toHaveBeenCalledTimes(0);
      expect(spyOnMockedContentAnalytics).toHaveBeenCalledTimes(0);
      expect(spyOnMockedServicesAnalytics).toHaveBeenCalledTimes(0);
      expect(spyOnMockedZendeskAnalytics).toHaveBeenCalledTimes(0);
      expect(spyOnMockedFCIAnalytics).toHaveBeenCalledTimes(0);
      expect(spyOnMockedMessagesAnalytics).toHaveBeenCalledTimes(0);

      expect(result).toBe(mockedAction);
    });
  });
});
