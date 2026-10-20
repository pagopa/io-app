import { createStackNavigator } from "@react-navigation/stack";
import { act, fireEventAsync } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert, Button, View } from "react-native";
import { createStore } from "redux";

import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContextAsync } from "../../../../../../utils/testWrapper";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ProximityConsents, StoredConsentData } from "../../store/types";
import { ItwConsentManagementDetailScreen } from "../ItwConsentManagementDetailScreen";
import { ItwConsentManagementScreen } from "../ItwConsentManagementScreen";
import { ItwConsentRevocationSuccessScreen } from "../ItwConsentRevocationSuccessScreen";

const mockToastSuccess = jest.fn();

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual("@io-app/design-system"),
  useIOToast: () => ({ success: mockToastSuccess })
}));

jest.mock("../../../../common/hooks/useItwCredentialName", () => ({
  useItwCredentialName: () => "Patente di guida"
}));

jest.mock("../../analytics");

const Stack = createStackNavigator<ItwParamsList>();
const credentialType = "mDL";
const consent: StoredConsentData = {
  credentials: [{ claimNames: ["given_name"], credentialType }],
  rpDisplayName: "Ministero dell'Interno",
  rpId: "verifier.example.it",
  savedAt: "2029-02-20T12:00:00.000Z"
};
const remainingConsent: StoredConsentData = {
  ...consent,
  rpDisplayName: "Comune",
  rpId: "other-verifier.example.it"
};
const unrelatedConsent: StoredConsentData = {
  ...consent,
  credentials: [
    { claimNames: ["given_name"], credentialType: "EuropeanDisabilityCard" }
  ]
};

describe("Consent management navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  it.each([
    { name: "revoking the last consent", revokeAll: false },
    { name: "revoking all consents", revokeAll: true }
  ])(
    "opens the success screen directly after $name and closes to the document",
    async ({ revokeAll }) => {
      const { component, onFocus, store } = await renderComponent({
        selected: consent,
        ...(revokeAll ? { remaining: remainingConsent } : {}),
        unrelated: unrelatedConsent
      });

      if (revokeAll) {
        await fireEventAsync.press(
          component.getByTestId("revoke-all-consents-action")
        );
      } else {
        await fireEventAsync.press(
          component.getByLabelText(consentDetailLabel(consent))
        );
        await fireEventAsync.press(
          component.getByTestId("revoke-consent-action")
        );
      }
      onFocus.mockClear();

      await confirmRevocation();

      expect(onFocus.mock.calls).toEqual([
        [ITW_ROUTES.PRESENTATION.CONSENT_REVOCATION_SUCCESS]
      ]);
      expect(store.getState().features.itWallet.proximity.consents).toEqual({
        unrelated: unrelatedConsent
      });
      expect(mockToastSuccess).not.toHaveBeenCalled();

      await fireEventAsync.press(
        component.getByText(I18n.t("global.buttons.close"))
      );

      expect(onFocus).toHaveBeenLastCalledWith(
        ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL
      );

      await fireEventAsync.press(component.getByText("Back to wallet"));

      expect(onFocus).toHaveBeenLastCalledWith(ITW_ROUTES.OFFLINE.WALLET);
      expect(component.getByTestId("wallet-screen")).toBeTruthy();
    }
  );

  it("returns once to the updated list when another consent remains", async () => {
    const { component, onFocus, store } = await renderComponent({
      selected: consent,
      remaining: remainingConsent
    });
    await fireEventAsync.press(
      component.getByLabelText(consentDetailLabel(consent))
    );
    await fireEventAsync.press(component.getByTestId("revoke-consent-action"));
    onFocus.mockClear();

    await confirmRevocation();

    expect(onFocus.mock.calls).toEqual([
      [ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT]
    ]);
    expect(store.getState().features.itWallet.proximity.consents).toEqual({
      remaining: remainingConsent
    });
    expect(component.queryByLabelText(consentDetailLabel(consent))).toBeNull();
    expect(
      component.getByLabelText(consentDetailLabel(remainingConsent))
    ).toBeTruthy();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.presentation.proximity.consentManagement.toast.done"
      )
    );
  });
});

const consentDetailLabel = (storedConsent: StoredConsentData) =>
  I18n.t(
    "features.itWallet.presentation.proximity.consentManagement.accessibility.openDetail",
    {
      relyingParty: storedConsent.rpDisplayName
    }
  );

const confirmRevocation = async () => {
  const buttons = jest.mocked(Alert.alert).mock.calls[0][2];
  const confirmButton = buttons?.find(button => button.style === "destructive");
  expect(confirmButton?.onPress).toBeDefined();
  await act(async () => {
    confirmButton?.onPress?.();
  });
};

const WalletScreen = () => {
  const navigation = useIONavigation();
  return (
    <View testID="wallet-screen">
      <Button
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
            params: { credentialType }
          })
        }
        title="Open document"
      />
    </View>
  );
};

const DocumentScreen = () => {
  const navigation = useIONavigation();
  return (
    <View>
      <Button
        onPress={() =>
          navigation.navigate(ITW_ROUTES.MAIN, {
            screen: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT,
            params: { credentialType }
          })
        }
        title="Manage consents"
      />
      <Button onPress={() => navigation.goBack()} title="Back to wallet" />
    </View>
  );
};

const renderComponent = async (consents: ProximityConsents) => {
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
  const store = createStore(appReducer, state as any);
  const onFocus = jest.fn();
  const Navigator = () => (
    <Stack.Navigator
      screenListeners={({ route }) => ({ focus: () => onFocus(route.name) })}
      screenOptions={{ animationEnabled: false, headerShown: false }}
    >
      <Stack.Screen component={WalletScreen} name={ITW_ROUTES.OFFLINE.WALLET} />
      <Stack.Screen
        component={DocumentScreen}
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL}
      />
      <Stack.Screen
        component={ItwConsentManagementScreen}
        name={ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT}
      />
      <Stack.Screen
        component={ItwConsentManagementDetailScreen}
        name={ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT_DETAIL}
      />
      <Stack.Screen
        component={ItwConsentRevocationSuccessScreen}
        name={ITW_ROUTES.PRESENTATION.CONSENT_REVOCATION_SUCCESS}
      />
    </Stack.Navigator>
  );
  const component = await renderScreenWithNavigationStoreContextAsync(
    Navigator,
    ITW_ROUTES.MAIN,
    {},
    store
  );
  await fireEventAsync.press(component.getByText("Open document"));
  await fireEventAsync.press(component.getByText("Manage consents"));

  return { component, onFocus, store };
};
