import { Body, IOMarkdownLite } from "@io-app/design-system";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as urlUtils from "../../../../../utils/url";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as analytics from "../../../analytics";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import * as machineSelectors from "../../../machine/credential/selectors";
import { testCredentialIssuanceDeps } from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../ItwIssuanceCredentialTrustIssuerScreen";

jest.unmock("@io-app/design-system");

jest.mock("../../../../../utils/hooks/usePreventScreenCapture", () => ({
  usePreventScreenCapture: jest.fn()
}));

describe("ItwIssuanceCredentialTrustIssuerScreen", () => {
  afterEach(() => jest.restoreAllMocks());

  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  it("makes the privacy paragraph keyboard focusable while keeping the link inline", () => {
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest.spyOn(machineSelectors, "selectIsLoading").mockReturnValue(false);
    jest.spyOn(machineSelectors, "selectRequiredClaims").mockReturnValue([]);
    jest.spyOn(machineSelectors, "selectCredentialType").mockReturnValue("mDL");
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
      .mockReturnValue(ItwStoredCredentialsMocks.eid);
    const openWebUrl = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(jest.fn());
    const trackOpenItwTos = jest
      .spyOn(analytics, "trackOpenItwTos")
      .mockImplementation(jest.fn());

    const component = renderComponent();
    const paragraph = component
      .UNSAFE_getByType(IOMarkdownLite)
      .findByType(Body);
    const privacyLink = component.getByRole("link", {
      name: /Informativa Privacy/
    });

    expect(paragraph.props.accessible).toBe(true);
    expect(paragraph.props.focusable).toBe(true);
    expect(privacyLink.type).toBe("Text");

    fireEvent.press(privacyLink);

    expect(openWebUrl).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(trackOpenItwTos).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider
        logic={logic}
        options={{ input: { deps: testCredentialIssuanceDeps() } }}
      >
        <ItwIssuanceCredentialTrustIssuerScreen />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
    {},
    createStore(appReducer, globalState as any)
  );
};
