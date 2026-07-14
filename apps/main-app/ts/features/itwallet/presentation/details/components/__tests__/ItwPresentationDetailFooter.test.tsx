import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import * as connectivitySelectors from "../../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig.ts";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../common/utils/itwMocksUtils.ts";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../../machine/credential/machine.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../../machine/credential/provider.tsx";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwPresentationDetailsFooter } from "../ItwPresentationDetailsFooter.tsx";

const mockTrackItwCredentialDelete = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@pagopa/io-app-design-system"
  ),
  useIOToast: () => ({
    error: mockToastError,
    info: mockToastInfo,
    success: mockToastSuccess
  })
}));

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackItwCredentialDelete: (credential: unknown, properties: unknown) =>
    mockTrackItwCredentialDelete(credential, properties)
}));

describe("ItwPresentationDetailsFooter", () => {
  beforeEach(() => {
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should render actions", () => {
    const { queryByTestId } = renderComponent(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
    );

    expect(queryByTestId("requestAssistanceActionTestID")).not.toBeNull();
    expect(queryByTestId("removeCredentialActionTestID")).not.toBeNull();
    expect(queryByTestId("openIPatenteActionTestID")).toBeNull();
  });

  it("should render iPatente action", () => {
    jest
      .spyOn(remoteConfigSelectors, "itwIPatenteCtaConfigSelector")
      .mockImplementation(() => ({
        visibility: true,
        url: "",
        service_id: ""
      }));

    const { queryByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    expect(queryByTestId("requestAssistanceActionTestID")).not.toBeNull();
    expect(queryByTestId("removeCredentialActionTestID")).not.toBeNull();
    expect(queryByTestId("openIPatenteActionTestID")).not.toBeNull();
  });

  it("tracks credential deletion from the detail screen with status and position", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(credentialSelectors, "itwCredentialStatusSelector")
      .mockImplementation(() => ({
        status: "expired",
        message: undefined
      }));

    const { getByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    fireEvent.press(getByTestId("removeCredentialActionTestID"));

    expect(Alert.alert).toHaveBeenCalled();
    expect(mockTrackItwCredentialDelete).toHaveBeenCalledWith("ITW_PG_V2", {
      credential_status: "expired",
      position: "screen"
    });
  });

  it("shows an offline toast and does not open the removal dialog when offline", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    const { getByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    fireEvent.press(getByTestId("removeCredentialActionTestID"));

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockTrackItwCredentialDelete).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(I18n.t("global.offline.toast"));
  });
});

const renderComponent = (credentialType: CredentialType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider logic={logic}>
        <ItwPresentationDetailsFooter
          credential={{
            ...ItwStoredCredentialsMocks.dc,
            credentialType
          }}
        />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
};
