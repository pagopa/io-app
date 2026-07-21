import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as analytics from "../../analytics";
import { StoredConsentData } from "../../store/types";
import { ItwConsentManagementScreen } from "../ItwConsentManagementScreen";

const mockNavigate = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({ navigate: mockNavigate })
}));

jest.mock("../../../../../common/hooks/useItwCredentialName", () => ({
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
    jest
      .spyOn(analytics, "trackItwConsentManagement")
      .mockImplementation(jest.fn());
  });

  it("shows the empty state when every consent has been revoked", () => {
    const component = renderComponent({});

    expect(component.getByTestId("consent-empty-state")).toBeTruthy();
    expect(analytics.trackItwConsentManagement).toHaveBeenCalledWith({
      credential: "ITW_PG_V2"
    });
  });

  it("opens the selected consent detail", () => {
    const component = renderComponent({ [consentKey]: consent });

    fireEvent.press(
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
});

const renderComponent = (consents: Record<string, StoredConsentData>) => {
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

  return renderScreenWithNavigationStoreContext<GlobalState>(
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
    createStore(appReducer, state as any)
  );
};
