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
import EuCovidCertWrongFormatKoScreen from "../EuCovidCertWrongFormatKoScreen";

describe("Test EuCovidCertNotFoundKoScreen", () => {
  jest.useFakeTimers();
  it("Should show the WorkunitGenericFailure and should send the mixpanel event if euCovidCertCurrentSelector return null", () => {
    const spyMixpanelTrack = jest.spyOn(mixpanelTrack, "mixpanelTrack");
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const wrongFormatScreen = renderComponent(globalState, false);

    expect(
      wrongFormatScreen.queryByTestId("WorkunitGenericFailure")
    ).not.toBeNull();
    expect(
      wrongFormatScreen.queryByTestId("EuCovidCertWrongFormatKoScreen")
    ).toBeNull();
    expect(spyMixpanelTrack).toBeCalled();
  });
  it("Should show the authorization code and the message identifier if euCovidCertCurrentSelector is not null, and onButton click should open the web url", () => {
    const spyOpenWebUrl = jest.spyOn(openWebUrl, "openWebUrl");
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const wrongFormatScreen = renderComponent({
      ...globalState,
      features: {
        ...globalState.features,
        euCovidCert: {
          ...globalState.features.euCovidCert
        }
      }
    });
    const requestAssistanceButton = wrongFormatScreen.queryByText(
      i18n.t("features.euCovidCertificate.ko.wrongFormat.cta")
    );

    expect(requestAssistanceButton).not.toBeNull();

    if (requestAssistanceButton !== null) {
      fireEvent.press(requestAssistanceButton);
      expect(spyOpenWebUrl).toBeCalled();
    }

    expect(
      wrongFormatScreen.queryByTestId("authorizationCodeToCopy")
    ).not.toBeNull();
    expect(
      wrongFormatScreen.queryByTestId("messageIdentifierToCopy")
    ).not.toBeNull();
    expect(
      wrongFormatScreen.queryByTestId("WorkunitGenericFailure")
    ).toBeNull();
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
      <EuCovidCertWrongFormatKoScreen />
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
