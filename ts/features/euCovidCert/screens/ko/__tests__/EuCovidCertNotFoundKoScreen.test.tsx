import { fireEvent } from "@testing-library/react-native";
import * as React from "react";

import { createStore } from "redux";
import i18n from "../../../../../i18n";
import * as mixpanelTrack from "../../../../../mixpanel";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import * as openWebUrl from "../../../../../utils/url";
import EUCOVIDCERT_ROUTES from "../../../navigation/routes";
import { EUCovidCertificateAuthCode } from "../../../types/EUCovidCertificate";
import { EUCovidContext } from "../../EuCovidCertificateRouterScreen";
import EuCovidCertNotFoundKoScreen from "../EuCovidCertNotFoundKoScreen";
import EuCovidCertWrongFormatKoScreen from "../EuCovidCertWrongFormatKoScreen";

describe("Test EuCovidCertNotFoundKoScreen", () => {
  jest.useFakeTimers();
  it("Should show the WorkunitGenericFailure and should send the mixpanel event if euCovidCertCurrentSelector return null", () => {
    const spyMixpanelTrack = jest.spyOn(mixpanelTrack, "mixpanelTrack");
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const notFoundScreen = renderComponent(globalState, false);

    expect(
      notFoundScreen.queryByTestId("WorkunitGenericFailure")
    ).not.toBeNull();
    expect(
      notFoundScreen.queryByTestId("EuCovidCertNotFoundKoScreen")
    ).toBeNull();
    expect(spyMixpanelTrack).toBeCalled();
  });
  it("Should show the authorization code and the message identifier if euCovidCertCurrentSelector is not null, and onButton click should open the web url", () => {
    const spyOpenWebUrl = jest.spyOn(openWebUrl, "openWebUrl");
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const notFoundScreen = renderComponent({
      ...globalState,
      features: {
        ...globalState.features,
        euCovidCert: {
          ...globalState.features.euCovidCert
        }
      }
    });
    const requestAssistanceButton = notFoundScreen.queryByText(
      i18n.t("features.euCovidCertificate.ko.notFound.cta")
    );

    expect(requestAssistanceButton).not.toBeNull();

    if (requestAssistanceButton !== null) {
      fireEvent.press(requestAssistanceButton);
      expect(spyOpenWebUrl).toBeCalled();
    }

    expect(
      notFoundScreen.queryByTestId("authorizationCodeToCopy")
    ).not.toBeNull();
    expect(
      notFoundScreen.queryByTestId("messageIdentifierToCopy")
    ).not.toBeNull();
    expect(notFoundScreen.queryByTestId("WorkunitGenericFailure")).toBeNull();
  });
});

const renderComponent = (state: GlobalState, withContext: boolean = true) => {
  const store = createStore(appReducer, state as any);

  const Component = withContext ? (
    <EUCovidContext.Provider
      value={{
        authCode: "authCode" as EUCovidCertificateAuthCode,
        messageId: "messageId"
      }}
    >
      <EuCovidCertNotFoundKoScreen />
    </EUCovidContext.Provider>
  ) : (
    <EuCovidCertWrongFormatKoScreen />
  );

  return renderScreenFakeNavRedux<GlobalState>(
    () => Component,
    EUCOVIDCERT_ROUTES.CERTIFICATE,
    {},
    store
  );
};
