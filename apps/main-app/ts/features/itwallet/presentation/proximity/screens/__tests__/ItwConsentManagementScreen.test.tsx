import { act, fireEventAsync } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContextAsync } from "../../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as analytics from "../../analytics";
import { StoredConsentData } from "../../store/types";
import { ItwConsentManagementScreen } from "../ItwConsentManagementScreen";

const mockNavigate = jest.fn();
const mockNavigationDispatch = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({
    navigate: mockNavigate,
    dispatch: mockNavigationDispatch
  })
}));

jest.mock("../../../../common/hooks/useItwCredentialName", () => ({
  useItwCredentialName: () => "Patente di guida"
}));

const consentKey = "consent-key";
const consent: StoredConsentData = {
  credentials: [{ claimNames: ["given_name"], credentialType: "mDL" }],
  rpDisplayName: "Ministero dell'Interno",
  rpId: "verifier.example.it",
  savedAt: "2029-02-20T12:00:00.000Z"
};

describe("ItwConsentManagementScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest
      .spyOn(analytics, "trackItwConsentManagement")
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

  it("returns to the document without showing an empty state when no consents exist", async () => {
    const { component } = await renderComponent({});

    expect(component.queryByTestId("consent-list")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: { credentialType: "mDL" }
    });
    expect(mockNavigationDispatch).not.toHaveBeenCalled();
    expect(analytics.trackItwConsentManagement).not.toHaveBeenCalled();
  });

  it("opens the selected consent detail", async () => {
    const { component } = await renderComponent({ [consentKey]: consent });

    expect(analytics.trackItwConsentManagement).toHaveBeenCalledWith({
      credential: "ITW_PG_V2"
    });

    await fireEventAsync.press(
      component.getByLabelText(
        I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.accessibility.openDetail",
          { relyingParty: consent.rpDisplayName }
        )
      )
    );

    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL,
      params: { consentKey, credentialType: "mDL" }
    });
  });

  it.each<{
    documentConsents: Record<string, StoredConsentData>;
    name: string;
  }>([
    { name: "one consent", documentConsents: { [consentKey]: consent } },
    {
      name: "multiple consents",
      documentConsents: {
        [consentKey]: consent,
        second: { ...consent, rpId: "another-rp" }
      }
    }
  ])(
    "revokes all document consents and opens the success screen with $name",
    async ({ documentConsents }) => {
      const unrelated = {
        ...consent,
        credentials: [
          {
            credentialType: "EuropeanDisabilityCard",
            claimNames: ["given_name"]
          }
        ]
      };
      const { component, store } = await renderComponent({
        ...documentConsents,
        unrelated
      });
      await fireEventAsync.press(
        component.getByTestId("revoke-all-consents-action")
      );

      expect(analytics.trackItwRevokeConsent).toHaveBeenCalledTimes(1);
      expect(
        analytics.trackItwRevokeConsentOperationBlock
      ).toHaveBeenCalledTimes(1);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      await act(async () => {
        alertButtons[0].onPress();
      });

      expect(
        analytics.trackItwRevokeConsentOperationBlockAction
      ).toHaveBeenCalledWith("confirm");
      expect(store.getState().features.itWallet.proximity.consents).toEqual({
        unrelated
      });
      expect(mockNavigationDispatch).toHaveBeenCalledTimes(1);
      expect(mockNavigationDispatch).toHaveBeenCalledWith({
        type: "REPLACE",
        payload: {
          name: ITW_ROUTES.PRESENTATION.CONSENT_REVOCATION_SUCCESS,
          params: { credentialType: "mDL" }
        }
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  it("keeps all consents when the revocation is cancelled", async () => {
    const consents = { [consentKey]: consent };
    const { component, store } = await renderComponent(consents);
    await fireEventAsync.press(
      component.getByTestId("revoke-all-consents-action")
    );
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const cancelButton = alertButtons.find(
      (button: { style: string }) => button.style === "cancel"
    );
    await act(async () => {
      cancelButton.onPress?.();
    });
    expect(
      analytics.trackItwRevokeConsentOperationBlockAction
    ).toHaveBeenCalledWith("cancel");
    expect(store.getState().features.itWallet.proximity.consents).toEqual(
      consents
    );
    expect(mockNavigationDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

const renderComponent = async (consents: Record<string, StoredConsentData>) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const state: GlobalState = {
    ...initialState,
    features: {
      ...initialState.features,
      itWallet: {
        ...initialState.features.itWallet,
        proximity: {
          ...initialState.features.itWallet.proximity,
          consents
        }
      }
    }
  };
  const routeParams = { credentialType: "mDL" };

  const store = createStore(appReducer, state as any);
  const component =
    await renderScreenWithNavigationStoreContextAsync<GlobalState>(
      () => (
        <ItwConsentManagementScreen
          navigation={{} as any}
          route={{
            key: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT,
            name: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT,
            params: routeParams
          }}
        />
      ),
      ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT,
      routeParams,
      store
    );
  return { component, store };
};
