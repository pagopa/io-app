import { act, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../common/utils/itwMocksUtils";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { itwCredentialIssuanceMachine } from "../../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  itwGrantProximityConsent,
  itwRevokeProximityConsentByKey
} from "../../../proximity/store/actions";
import { ConsentData } from "../../../proximity/store/types";
import { generateConsentKey } from "../../../proximity/store/utils";
import { ItwPresentationDetailsFooter } from "../ItwPresentationDetailsFooter";

const mockTrackItwCredentialDelete = jest.fn();
const mockTrackItwCredentialManageConsent = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();
const mockToastSuccess = jest.fn();

const drivingLicenseConsent: ConsentData = {
  rpId: "rp-001",
  credentials: [
    {
      credentialType: CredentialType.DRIVING_LICENSE,
      claimNames: ["given_name"]
    }
  ]
};
const anotherDrivingLicenseConsent: ConsentData = {
  ...drivingLicenseConsent,
  rpId: "rp-002"
};
const healthCardConsent: ConsentData = {
  rpId: "rp-003",
  credentials: [
    {
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      claimNames: ["given_name"]
    }
  ]
};

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
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

jest.mock("../../../proximity/analytics", () => ({
  ...jest.requireActual("../../../proximity/analytics"),
  trackItwCredentialManageConsent: (properties: unknown) =>
    mockTrackItwCredentialManageConsent(properties)
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
    expect(queryByTestId("manageConsentsActionTestID")).toBeNull();
  });

  it.each([
    { name: "no consents", consents: [], visible: false },
    {
      name: "a consent for another document",
      consents: [healthCardConsent],
      visible: false
    },
    {
      name: "one consent for the document",
      consents: [drivingLicenseConsent],
      visible: true
    },
    {
      name: "multiple consents for the document",
      consents: [drivingLicenseConsent, anotherDrivingLicenseConsent],
      visible: true
    }
  ])(
    "sets consent management visibility with $name",
    ({ consents, visible }) => {
      const { queryByTestId } = renderComponent(
        CredentialType.DRIVING_LICENSE,
        consents
      );

      expect(queryByTestId("manageConsentsActionTestID") !== null).toBe(
        visible
      );
    }
  );

  it.each([
    {
      name: "the last consent for the document is revoked",
      consents: [drivingLicenseConsent, healthCardConsent],
      visible: false
    },
    {
      name: "another consent for the document remains",
      consents: [drivingLicenseConsent, anotherDrivingLicenseConsent],
      visible: true
    }
  ])("updates consent management when $name", ({ consents, visible }) => {
    const { queryByTestId, store } = renderComponent(
      CredentialType.DRIVING_LICENSE,
      consents
    );
    expect(queryByTestId("manageConsentsActionTestID")).not.toBeNull();

    act(() => {
      store.dispatch(
        itwRevokeProximityConsentByKey(
          generateConsentKey(drivingLicenseConsent)
        )
      );
    });

    expect(queryByTestId("manageConsentsActionTestID") !== null).toBe(visible);
  });

  it("tracks consent management with saved consents", () => {
    const { getByTestId } = renderComponent(CredentialType.DRIVING_LICENSE, [
      drivingLicenseConsent
    ]);

    fireEvent.press(getByTestId("manageConsentsActionTestID"));

    expect(mockTrackItwCredentialManageConsent).toHaveBeenCalledWith({
      credential: "ITW_PG_V2"
    });
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

  it("should not render the assistance action for IT-Wallet", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const { queryByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    expect(queryByTestId("requestAssistanceActionTestID")).toBeNull();
  });

  it("tracks credential deletion from the detail screen with status and position", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(credentialSelectors, "itwCredentialStatusSelector")
      .mockImplementation(() => ({
        status: "expired"
      }));

    const { getByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    fireEvent.press(getByTestId("removeCredentialActionTestID"));

    expect(Alert.alert).toHaveBeenCalled();
    expect(mockTrackItwCredentialDelete).toHaveBeenCalledWith("ITW_PG_V2", {
      credential_status: "expired",
      position: "screen"
    });
  });

  it("opens the removal dialog when offline", () => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    const { getByTestId } = renderComponent(CredentialType.DRIVING_LICENSE);

    fireEvent.press(getByTestId("removeCredentialActionTestID"));

    expect(Alert.alert).toHaveBeenCalled();
    expect(mockTrackItwCredentialDelete).toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });
});

const renderComponent = (
  credentialType: CredentialType,
  consents: ReadonlyArray<ConsentData> = []
) => {
  const globalState = consents.reduce(
    (state, consent) => appReducer(state, itwGrantProximityConsent(consent)),
    appReducer(undefined, applicationChangeState("active"))
  );
  const store = createStore(appReducer, globalState as any);

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  const component = renderScreenWithNavigationStoreContext<GlobalState>(
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
    store
  );
  return { ...component, store };
};
