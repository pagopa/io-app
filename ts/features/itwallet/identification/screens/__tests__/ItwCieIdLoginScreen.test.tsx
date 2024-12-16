/* eslint-disable functional/no-let */
import React from "react";
import { createStore } from "redux";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { createActor } from "xstate";
import _ from "lodash";
import { Linking } from "react-native";
import { isCieIdAvailable, openCieIdApp } from "@pagopa/io-react-native-cieid";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ITW_ROUTES } from "../../../navigation/routes";
import ItwCieIdLoginScreen from "../cieId/ItwCieIdLoginScreen";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";

jest.mock("@pagopa/io-react-native-cieid", () => ({
  isCieIdAvailable: jest.fn(),
  openCieIdApp: jest.fn()
}));

let mockIsIOS = false;
let mockIsAndroid = true;
jest.mock("../../../../../utils/platform", () => ({
  get isIos() {
    return mockIsIOS;
  },
  get isAndroid() {
    return mockIsAndroid;
  }
}));

describe("ItwCieIdLoginScreen", () => {
  afterEach(jest.clearAllMocks);

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
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwEidIssuanceMachine.provide({
    actions: { onInit: jest.fn() }
  });

  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  return renderScreenWithNavigationStoreContext<GlobalState>(
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
        <ItwCieIdLoginScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN,
    {},
    createStore(appReducer, globalState as any)
  );
};
