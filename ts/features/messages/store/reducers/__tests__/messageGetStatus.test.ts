import { appReducer } from "../../../../../store/reducers";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import {
  getMessageDataAction,
  reloadAllMessages,
  resetGetMessageDataAction
} from "../../actions";
import { applicationChangeState } from "../../../../../store/actions/application";
import { Action } from "../../../../../store/actions/types";
import {
  INITIAL_STATE,
  blockedFromPushNotificationSelector,
  messageGetStatusReducer,
  messageSuccessDataSelector,
  showSpinnerFromMessageGetStatusSelector
} from "../messageGetStatus";

describe("messageGetStatusReducer", () => {
  it("INITIAL_STATE should match expected one", () => {
    const expectedInitialState = {
      status: "idle"
    };
    expect(INITIAL_STATE).toStrictEqual(expectedInitialState);
  });
  it("should match expected initial state", () => {
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    expect(initialState).toStrictEqual(INITIAL_STATE);
  });
  it("should match loading state after getMessageDataAction.request action", () => {
    const messageId = "m1";
    const fromPushNotification = false;
    const expectedLoadingState = {
      status: "loading",
      data: {
        messageId,
        fromPushNotification
      }
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const loadingState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.request({
        messageId,
        fromPushNotification
      })
    );
    expect(loadingState).toStrictEqual(expectedLoadingState);
  });
  it("should match successful state after getMessageDataAction.success action", () => {
    const successData = {
      messageId: "m1",
      serviceId: "s1" as ServiceId,
      serviceName: "name",
      firstTimeOpening: true,
      isPNMessage: false,
      organizationName: "orgName",
      organizationFiscalCode: "orgFisCod",
      containsAttachments: false,
      hasRemoteContent: false,
      hasFIMSCTA: false,
      createdAt: new Date()
    };
    const expectedSuccessState = {
      status: "success",
      successData
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const successState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.success(successData)
    );
    expect(successState).toStrictEqual(expectedSuccessState);
  });
  it("should match failure state after getMessageDataAction.failure action", () => {
    const failurePhase = "paginatedMessage";
    const expectedFailureState = {
      status: "error",
      failurePhase
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const failureState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.failure({ phase: failurePhase })
    );
    expect(failureState).toStrictEqual(expectedFailureState);
  });
  it("should match blocked failure state after getMessageDataAction.failure action for a blocked operation", () => {
    const failurePhase = "preconditions";
    const expectedBlockedFailureState = {
      status: "blocked",
      failurePhase
    };
    const initialState = messageGetStatusReducer(undefined, {} as Action);
    const blockedFailureState = messageGetStatusReducer(
      initialState,
      getMessageDataAction.failure({
        phase: failurePhase,
        blockedFromPushNotificationOpt: true
      })
    );
    expect(blockedFailureState).toStrictEqual(expectedBlockedFailureState);
  });
  it("should match initial state after resetGetMessageDataAction action", () => {
    const failureState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.failure({ phase: "paginatedMessage" })
    );
    expect(failureState).not.toStrictEqual(INITIAL_STATE);
    const resetState = messageGetStatusReducer(
      failureState,
      resetGetMessageDataAction()
    );
    expect(resetState).toStrictEqual(INITIAL_STATE);
  });
  it("should match initial state after reloadAllMessages.request action", () => {
    const failureState = messageGetStatusReducer(
      undefined,
      getMessageDataAction.failure({ phase: "paginatedMessage" })
    );
    expect(failureState).not.toStrictEqual(INITIAL_STATE);
    const resetState = messageGetStatusReducer(
      failureState,
      reloadAllMessages.request({
        filter: {},
        pageSize: 20,
        fromUserAction: false
      })
    );
    expect(resetState).toStrictEqual(INITIAL_STATE);
  });
});
describe("showSpinnerFromMessageGetStatusSelector", () => {
  it("should return true for initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const showSpinner = showSpinnerFromMessageGetStatusSelector(globalState);
    expect(showSpinner).toBe(true);
  });
  it("should return true for loading state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.request({
        messageId: "m1",
        fromPushNotification: false
      })
    );
    const showSpinner = showSpinnerFromMessageGetStatusSelector(globalState);
    expect(showSpinner).toBe(true);
  });
  it("should return true for blocked failure state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    );
    const showSpinner = showSpinnerFromMessageGetStatusSelector(globalState);
    expect(showSpinner).toBe(true);
  });
  it("should return true for success state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.success({
        messageId: "m1",
        serviceId: "s1" as ServiceId,
        serviceName: "name",
        firstTimeOpening: true,
        isPNMessage: false,
        organizationName: "orgName",
        organizationFiscalCode: "orgFisCod",
        containsAttachments: false,
        hasRemoteContent: false,
        hasFIMSCTA: false,
        createdAt: new Date()
      })
    );
    const showSpinner = showSpinnerFromMessageGetStatusSelector(globalState);
    expect(showSpinner).toBe(true);
  });
  it("should return false for failure (non blocking) state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({ phase: "messageDetails" })
    );
    const showSpinner = showSpinnerFromMessageGetStatusSelector(globalState);
    expect(showSpinner).toBe(false);
  });
});
describe("messageSuccessDataSelector", () => {
  it("should return undefined for initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const successData = messageSuccessDataSelector(globalState);
    expect(successData).toBeUndefined();
  });
  it("should return undefined for loading state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.request({
        messageId: "m1",
        fromPushNotification: false
      })
    );
    const successData = messageSuccessDataSelector(globalState);
    expect(successData).toBeUndefined();
  });
  it("should return undefined for blocked failure state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    );
    const successData = messageSuccessDataSelector(globalState);
    expect(successData).toBeUndefined();
  });
  it("should return undefined for failure (non blocking) state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({ phase: "messageDetails" })
    );
    const successData = messageSuccessDataSelector(globalState);
    expect(successData).toBeUndefined();
  });
  it("should match expected success data for success state", () => {
    const expectedSuccessData = {
      messageId: "m1",
      serviceId: "s1" as ServiceId,
      serviceName: "name",
      firstTimeOpening: true,
      isPNMessage: false,
      organizationFiscalCode: "orgFisCod",
      organizationName: "orgName",
      containsAttachments: false,
      hasRemoteContent: false,
      hasFIMSCTA: false,
      createdAt: new Date()
    };
    const globalState = appReducer(
      undefined,
      getMessageDataAction.success(expectedSuccessData)
    );
    const successData = messageSuccessDataSelector(globalState);
    expect(successData).toStrictEqual(expectedSuccessData);
  });
});
describe("blockedFromPushNotificationSelector", () => {
  it("should return false for initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const blockedFromPush = blockedFromPushNotificationSelector(globalState);
    expect(blockedFromPush).toBe(false);
  });
  it("should return false for loading state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.request({
        messageId: "m1",
        fromPushNotification: false
      })
    );
    const blockedFromPush = blockedFromPushNotificationSelector(globalState);
    expect(blockedFromPush).toBe(false);
  });
  it("should return false for success state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.success({
        messageId: "m1",
        serviceId: "s1" as ServiceId,
        serviceName: "name",
        firstTimeOpening: true,
        isPNMessage: false,
        organizationName: "orgName",
        organizationFiscalCode: "orgFisCod",
        containsAttachments: false,
        hasRemoteContent: false,
        hasFIMSCTA: false,
        createdAt: new Date()
      })
    );
    const blockedFromPush = blockedFromPushNotificationSelector(globalState);
    expect(blockedFromPush).toBe(false);
  });
  it("should return false for failure (non blocking) state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({ phase: "messageDetails" })
    );
    const blockedFromPush = blockedFromPushNotificationSelector(globalState);
    expect(blockedFromPush).toBe(false);
  });
  it("should return true for blocked failure state", () => {
    const globalState = appReducer(
      undefined,
      getMessageDataAction.failure({
        phase: "preconditions",
        blockedFromPushNotificationOpt: true
      })
    );
    const blockedFromPush = blockedFromPushNotificationSelector(globalState);
    expect(blockedFromPush).toBe(true);
  });
});
