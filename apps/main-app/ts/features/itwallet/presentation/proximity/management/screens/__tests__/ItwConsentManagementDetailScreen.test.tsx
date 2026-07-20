import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../../../navigation/routes";
import * as analytics from "../../../analytics";
import { StoredConsentData } from "../../../store/types";
import { ItwConsentManagementDetailScreen } from "../ItwConsentManagementDetailScreen";

const mockGoBack = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("../../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({ goBack: mockGoBack })
}));

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual("@io-app/design-system"),
  useIOToast: () => ({ success: mockToastSuccess })
}));

const consentKey = "consent-key";
const consent: StoredConsentData = {
  credentials: [{ claimNames: ["given_name"], credentialType: "mDL" }],
  rpDisplayName: "Ministero dell'Interno",
  rpId: "verifier.example.it",
  savedAt: "2029-02-20T12:00:00.000Z"
};

describe("ItwConsentManagementDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackItwConsentManagementDetail")
      .mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackItwRevokeConsent")
      .mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackItwRevokeConsentOperationBlock")
      .mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackItwRevokeConsentOperationBlockAction")
      .mockImplementation(jest.fn());
  });

  it("revokes the selected consent and returns to the management list", () => {
    const { component, store } = renderComponent(consent);

    fireEvent.press(component.getByTestId("revoke-consent-action"));

    expect(analytics.trackItwRevokeConsent).toHaveBeenCalledTimes(1);
    expect(analytics.trackItwRevokeConsentOperationBlock).toHaveBeenCalledTimes(
      1
    );
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    alertButtons[0].onPress();

    expect(
      store.getState().features.itWallet.proximity.consents[consentKey]
    ).toBeUndefined();
    expect(
      analytics.trackItwRevokeConsentOperationBlockAction
    ).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.alert.confirm"
      )
    );
    expect(mockToastSuccess).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.toast.done"
      )
    );
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("returns safely when the consent key no longer exists", () => {
    renderComponent(undefined);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (storedConsent: StoredConsentData | undefined) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const state: GlobalState = {
    ...initialState,
    features: {
      ...initialState.features,
      itWallet: {
        ...initialState.features.itWallet,
        proximity: {
          ...initialState.features.itWallet.proximity,
          consents: storedConsent ? { [consentKey]: storedConsent } : {}
        }
      }
    }
  };
  const store = createStore(appReducer, state as any);
  const routeParams = { consentKey, credentialType: "mDL" };

  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwConsentManagementDetailScreen
        navigation={{} as any}
        route={{
          key: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
          name: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
          params: routeParams
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
    routeParams,
    store
  );

  return { component, store };
};
