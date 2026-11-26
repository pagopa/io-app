/* eslint-disable functional/no-let */
import {
  CieIdErrorResult,
  isCieIdAvailable,
  openCieIdApp
} from "@pagopa/io-react-native-cieid";
import { fireEvent, renderHook, waitFor } from "@testing-library/react-native";
import _ from "lodash";
import { Linking } from "react-native";
import { createStore } from "redux";
import { ActorRefFrom, createActor } from "xstate";

import * as Mixpanel from "../../../../../../mixpanel";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ITW_ISSUANCE_ERRORS_EVENTS } from "../../../../issuance/analytics/enum";
import { useEidEventsTracking } from "../../../../issuance/hooks/useEidEventsTracking";
import { IssuanceFailureType } from "../../../../machine/eid/failure";
import { itwEidIssuanceMachine } from "../../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { testEidIssuanceDeps } from "../../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../../navigation/routes";
import ItwCieIdLoginScreen from "../../../cieId/screens/ItwCieIdLoginScreen";

jest.mock("@pagopa/io-react-native-cieid", () => ({
  isCieIdAvailable: jest.fn(),
  openCieIdApp: jest.fn()
}));

jest.mock("react-native-webview", () => {
  const { View } = require("react-native");

  const WebView = (props: any) => <View {...props} />;

  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

let mockIsIOS = false;
let mockIsAndroid = true;
jest.mock("../../../../../../utils/platform", () => ({
  get isIos() {
    return mockIsIOS;
  },
  get isAndroid() {
    return mockIsAndroid;
  }
}));

describe("ItwCieIdLoginScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.mocked(openCieIdApp).mockReset();
    jest.restoreAllMocks();
  });

  const simulateCieIdError = (
    code: CieIdErrorResult["code"],
    message?: CieIdErrorResult["message"]
  ) => {
    jest.mocked(isCieIdAvailable).mockReturnValue(true);
    jest.mocked(openCieIdApp).mockImplementation((_url, callback) => {
      callback({ id: "ERROR", code, message, userInfo: null });
    });
    mockIsAndroid = true;
    mockIsIOS = false;

    const { getByTestId, getFailure } = renderComponent();
    fireEvent(getByTestId("cieid-webview"), "onShouldStartLoadWithRequest", {
      url: "https://idserver.servizicie.interno.gov.it/idp/login/livello2"
    });
    return getFailure();
  };

  it.each([
    { message: "IDP_HTTP_ERROR" as const, expectedMessage: "IDP_HTTP_ERROR" },
    { message: undefined, expectedMessage: undefined }
  ])(
    "forwards the native error to Mixpanel (message: $message)",
    ({ message, expectedMessage }) => {
      const mixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();

      const failure = simulateCieIdError("AUTHENTICATION_ERROR", message);
      expect(failure?.type).toBe(IssuanceFailureType.UNEXPECTED);
      if (!failure) {
        throw new Error("Expected CieID authentication to fail");
      }

      renderHook(() =>
        useEidEventsTracking({
          credential: "ITW_ID",
          failure,
          identification: { mode: "cieId", level: "L2" },
          issuanceLevel: "l3"
        })
      );

      expect(mixpanelTrack).toHaveBeenCalledWith(
        ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_REQUEST_UNEXPECTED_FAILURE,
        expect.objectContaining({
          reason: {
            code: "UNEXPECTED",
            errorDescription: "AUTHENTICATION_ERROR",
            message: expectedMessage
          }
        })
      );
    }
  );

  it("maps CIE_NOT_REGISTERED to its dedicated failure", () => {
    expect(simulateCieIdError("CIE_NOT_REGISTERED", "INVALID_REQUEST")).toEqual(
      {
        type: IssuanceFailureType.CIE_NOT_REGISTERED,
        reason: "CIE_NOT_REGISTERED"
      }
    );
  });

  it("goes back without reporting a failure when CieID is cancelled", () => {
    jest.mocked(isCieIdAvailable).mockReturnValue(true);
    jest.mocked(openCieIdApp).mockImplementation((_url, callback) => {
      callback({
        id: "ERROR",
        code: "CIEID_OPERATION_CANCEL",
        message: "USER_CANCELLED",
        userInfo: null
      });
    });
    mockIsAndroid = true;
    mockIsIOS = false;

    const { getByTestId, getFailure, getMachineState } = renderComponent();
    fireEvent(getByTestId("cieid-webview"), "onShouldStartLoadWithRequest", {
      url: "https://idserver.servizicie.interno.gov.it/idp/login/livello2"
    });

    expect(getFailure()).toBeUndefined();
    expect(getMachineState()).toEqual({
      UserIdentification: "Identification"
    });
  });

  it("should continue in the webview when CieID is not installed", () => {
    (isCieIdAvailable as jest.Mock).mockImplementation(() => false);

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cieid-webview");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: "https://idserver.servizicie.interno.gov.it/idp/login/livello2"
    });

    expect(openCieIdApp).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("should open CieID app when it is installed (Android)", () => {
    (isCieIdAvailable as jest.Mock).mockImplementation(() => true);
    mockIsAndroid = true;
    mockIsIOS = false;

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cieid-webview");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: "https://idserver.servizicie.interno.gov.it/idp/login/livello2"
    });

    expect(openCieIdApp).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("should open CieID app when it is installed (iOS)", async () => {
    (isCieIdAvailable as jest.Mock).mockImplementation(() => true);
    mockIsAndroid = false;
    mockIsIOS = true;

    jest.spyOn(Linking, "openURL").mockReturnValue(Promise.resolve());
    const { getByTestId } = renderComponent();
    const webView = getByTestId("cieid-webview");

    await waitFor(() => {
      fireEvent(webView, "onShouldStartLoadWithRequest", {
        url: "https://idserver.servizicie.interno.gov.it/idp/login/livello2"
      });
    });
    expect(openCieIdApp).not.toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalledTimes(1);
  });

  // Regression tests: the raw WebView native event used to be forwarded to the state
  // machine, where it was stringified into an unusable "[object Object]" error code.
  describe("when the webview fails to load", () => {
    const webViewErrorScenarios = [
      {
        name: "network error with a description",
        event: "onError",
        nativeEvent: {
          code: -2,
          description: "net::ERR_NAME_NOT_RESOLVED",
          url: "https://idserver.servizicie.interno.gov.it"
        },
        expectedMessage: "CIEID_WEBVIEW_ERROR_-2: net::ERR_NAME_NOT_RESOLVED"
      },
      {
        name: "network error without a description",
        event: "onError",
        nativeEvent: {
          code: -1,
          description: "",
          url: "https://idserver.servizicie.interno.gov.it"
        },
        expectedMessage: "CIEID_WEBVIEW_ERROR_-1"
      },
      {
        name: "http error",
        event: "onHttpError",
        nativeEvent: {
          statusCode: 502,
          description: "Bad Gateway",
          url: "https://idserver.servizicie.interno.gov.it"
        },
        expectedMessage: "CIEID_WEBVIEW_HTTP_ERROR_502"
      }
    ];

    it.each(webViewErrorScenarios)(
      "should report a meaningful error code for a $name",
      ({ event, nativeEvent, expectedMessage }) => {
        (isCieIdAvailable as jest.Mock).mockImplementation(() => true);
        mockIsAndroid = true;
        mockIsIOS = false;

        const { getByTestId, getFailure } = renderComponent();

        fireEvent(getByTestId("cieid-webview"), event, { nativeEvent });

        const failure = getFailure();
        expect(failure?.reason).toBeInstanceOf(Error);
        expect(failure?.reason).toHaveProperty("message", expectedMessage);
      }
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwEidIssuanceMachine.provide({
    actions: {
      onInit: jest.fn(),
      navigateToFailureScreen: jest.fn(),
      navigateToIdentificationScreen: jest.fn()
    }
  });

  const initialSnapshot = createActor(logic, {
    input: { deps: testEidIssuanceDeps() }
  }).getSnapshot();

  let machineRef: ActorRefFrom<typeof itwEidIssuanceMachine> | undefined;
  const CaptureMachineRef = () => {
    machineRef = ItwEidIssuanceMachineContext.useActorRef();
    return null;
  };

  const rendered = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{
          snapshot: _.merge(initialSnapshot, {
            value: { UserIdentification: { CieID: "CompletingCieIDAuthFlow" } },
            context: {
              authenticationContext: { authUrl: "https://test.it" }
            }
          })
        }}
      >
        <CaptureMachineRef />
        <ItwCieIdLoginScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN,
    {},
    createStore(appReducer, globalState as any)
  );

  return {
    ...rendered,
    getFailure: () => machineRef?.getSnapshot().context.failure,
    getMachineState: () => machineRef?.getSnapshot().value
  };
};
