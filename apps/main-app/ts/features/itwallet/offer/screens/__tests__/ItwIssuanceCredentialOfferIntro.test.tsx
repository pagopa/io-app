import { createStackNavigator } from "@react-navigation/stack";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Text } from "react-native";
import { Action, createStore } from "redux";

import * as appParamsList from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { appReducer } from "../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as itwCommonSelectors from "../../../common/store/selectors";
import * as credentialStatusUtils from "../../../common/utils/itwCredentialStatusUtils";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as catalogSelectors from "../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import {
  selectCredentialType,
  selectResolvedCredentialOffer
} from "../../../machine/credential/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackItwUpgradeL3Mandatory,
  trackItwUpgradeL3MandatoryCancel,
  trackItwUpgradeL3MandatoryConfirm
} from "../../../presentation/remote/analytics";
import { ItwL3UpgradeTrigger } from "../../../presentation/remote/analytics/utils/types";
import { ItwIssuanceCredentialOfferIntroScreen } from "../ItwIssuanceCredentialOfferIntro";

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../presentation/remote/analytics", () => ({
  trackItwUpgradeL3Mandatory: jest.fn(),
  trackItwUpgradeL3MandatoryCancel: jest.fn(),
  trackItwUpgradeL3MandatoryConfirm: jest.fn()
}));

const T_CREDENTIAL_OFFER_URI =
  "openid-credential-offer://?credential_offer_uri=https://eaa.wallet.ipzs.it/offers/123";
const T_CREDENTIAL_TYPE = "education_degree";
const T_TRUST_ISSUER_BASE_URL = "https://eaa.wallet.ipzs.it";
const TEST_NAVIGATOR_ROUTE = "TEST_NAVIGATOR";

const Stack = createStackNavigator<ItwParamsList>();

describe("ItwIssuanceCredentialOfferIntroScreen", () => {
  const machineSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      getParent: jest.fn(() => ({ setOptions: jest.fn() })),
      goBack: jest.fn(),
      setOptions: jest.fn()
    } as any);

    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue("valid");
    jest
      .spyOn(itwCommonSelectors, "itwIsL3EnabledSelector")
      .mockReturnValue(true);
    jest
      .spyOn(catalogSelectors, "itwCredentialIntroContentSelector")
      .mockReturnValue(() => undefined);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: machineSend } as any);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useSelector")
      .mockImplementation(selector => {
        if (selector === selectResolvedCredentialOffer) {
          return {
            offer: { credential_issuer: T_TRUST_ISSUER_BASE_URL },
            grantDetails: {
              authorizationCodeGrant: {
                authorizationServer: T_TRUST_ISSUER_BASE_URL,
                scope: T_CREDENTIAL_TYPE
              }
            }
          } as any;
        }

        if (selector === selectCredentialType) {
          return T_CREDENTIAL_TYPE as any;
        }

        return undefined as any;
      });
  });

  it("preserves the resolved offer without navigating to discovery from the screen", () => {
    const onDiscoveryParams = jest.fn();
    const { queryByTestId } = renderComponent(onDiscoveryParams);

    expect(queryByTestId("DiscoveryInfoScreenTestID")).toBeNull();
    expect(onDiscoveryParams).not.toHaveBeenCalled();
    expect(machineSend).not.toHaveBeenCalledWith({ type: "close" });
  });

  it("asks to activate the wallet when no wallet instance is active", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    const onDiscoveryParams = jest.fn();
    const { queryByText, getByText } = renderComponent(onDiscoveryParams);

    expect(
      queryByText(
        I18n.t("features.itWallet.issuance.credentialOffer.activation.title")
      )
    ).not.toBeNull();
    expect(machineSend).not.toHaveBeenCalledWith({
      type: "confirm-credential-offer"
    });
    expect(trackItwUpgradeL3Mandatory).toHaveBeenCalledTimes(1);
    expect(trackItwUpgradeL3Mandatory).toHaveBeenCalledWith(
      ItwL3UpgradeTrigger.ADD_CREDENTIAL
    );

    fireEvent.press(
      getByText(
        I18n.t(
          "features.itWallet.issuance.credentialOffer.activation.primaryAction"
        )
      )
    );

    expect(trackItwUpgradeL3MandatoryConfirm).toHaveBeenCalledWith(
      ItwL3UpgradeTrigger.ADD_CREDENTIAL
    );
    expect(trackItwUpgradeL3MandatoryCancel).not.toHaveBeenCalled();
    expect(machineSend).toHaveBeenCalledWith({ type: "close" });
    expect(onDiscoveryParams).toHaveBeenCalledWith({
      animationEnabled: false,
      credentialType: T_CREDENTIAL_TYPE,
      level: "l3"
    });
  });

  it("tracks cancellation of the wallet activation required to add a credential", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    const { getByText } = renderComponent(jest.fn());

    fireEvent.press(getByText(I18n.t("global.buttons.cancel")));

    expect(trackItwUpgradeL3MandatoryCancel).toHaveBeenCalledWith(
      ItwL3UpgradeTrigger.ADD_CREDENTIAL
    );
    expect(trackItwUpgradeL3MandatoryConfirm).not.toHaveBeenCalled();
    expect(machineSend).toHaveBeenCalledWith({ type: "close" });
  });

  it.each([
    { name: "offer", unresolvedSelector: selectResolvedCredentialOffer },
    { name: "credential type", unresolvedSelector: selectCredentialType }
  ])(
    "does not track activation while the $name is unresolved",
    ({ unresolvedSelector }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(false);
      const useSelectorMock = jest.spyOn(
        ItwCredentialIssuanceMachineContext,
        "useSelector"
      );
      const resolvedImplementation = useSelectorMock.getMockImplementation();
      useSelectorMock.mockImplementation(selector =>
        selector === unresolvedSelector
          ? undefined
          : resolvedImplementation?.(selector)
      );

      const { queryByText } = renderComponent(jest.fn());

      expect(
        queryByText(
          I18n.t("features.itWallet.issuance.credentialOffer.activation.title")
        )
      ).toBeNull();
      expect(trackItwUpgradeL3Mandatory).not.toHaveBeenCalled();
    }
  );

  it.each(["jwtExpired", "jwtExpiring"])(
    "asks to confirm the identity when the eID is %s",
    eidStatus => {
      jest
        .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
        .mockReturnValue(eidStatus as never);

      const { queryByText } = renderComponent(jest.fn());

      expect(
        queryByText(
          I18n.t(
            "features.itWallet.issuance.credentialOffer.confirmIdentity.title"
          )
        )
      ).not.toBeNull();
      expect(machineSend).not.toHaveBeenCalledWith({
        type: "confirm-credential-offer"
      });
      expect(trackItwUpgradeL3Mandatory).not.toHaveBeenCalled();
    }
  );

  it("auto-confirms the offer when the credential is not in the wallet and there is no introduction content", () => {
    const { queryByText } = renderComponent(jest.fn());

    expect(
      queryByText(
        I18n.t("features.itWallet.issuance.credentialAlreadyAdded.title")
      )
    ).toBeNull();
    expect(machineSend).toHaveBeenCalledWith({
      type: "confirm-credential-offer"
    });
    expect(trackItwUpgradeL3Mandatory).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "the credential name from the catalogue",
      catalogueName: "Laurea dal catalogo",
      expectedTitle: "Laurea dal catalogo"
    },
    {
      name: "the fallback title when the catalogue cannot resolve the name",
      catalogueName: undefined,
      expectedTitle: I18n.t(
        "features.itWallet.issuance.credentialOffer.intro.fallbackTitle"
      )
    }
  ])("shows $name as title", ({ catalogueName, expectedTitle }) => {
    jest
      .spyOn(catalogSelectors, "itwCredentialIntroContentSelector")
      .mockReturnValue(() => "Introduction content");
    jest
      .spyOn(catalogSelectors, "itwCredentialNameResolverSelector")
      .mockReturnValue(
        (_type: string | undefined, withDefault = "") =>
          catalogueName ?? withDefault
      );

    const { queryByText } = renderComponent(jest.fn());

    expect(queryByText(expectedTitle)).not.toBeNull();
  });

  it("blocks the flow when the offered credential is already in the wallet and valid", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialSelector")
      .mockReturnValue((() => ({})) as any);
    jest
      .spyOn(credentialStatusUtils, "getCredentialStatus")
      .mockReturnValue("valid");

    const { queryByText } = renderComponent(jest.fn());

    expect(
      queryByText(
        I18n.t("features.itWallet.issuance.credentialAlreadyAdded.title")
      )
    ).not.toBeNull();
    expect(machineSend).not.toHaveBeenCalledWith({
      type: "confirm-credential-offer"
    });
    expect(trackItwUpgradeL3Mandatory).not.toHaveBeenCalled();
  });

  it("continues the flow when the stored credential is no longer valid", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialSelector")
      .mockReturnValue((() => ({})) as any);
    jest
      .spyOn(credentialStatusUtils, "getCredentialStatus")
      .mockReturnValue("expired");

    const { queryByText } = renderComponent(jest.fn());

    expect(
      queryByText(
        I18n.t("features.itWallet.issuance.credentialAlreadyAdded.title")
      )
    ).toBeNull();
    expect(machineSend).toHaveBeenCalledWith({
      type: "confirm-credential-offer"
    });
  });
});

const renderComponent = (
  onDiscoveryParams: (
    params: ItwParamsList[typeof ITW_ROUTES.DISCOVERY.INFO] | undefined
  ) => void
) => {
  const sequenceOfActions: ReadonlyArray<Action> = [
    applicationChangeState("active"),
    startupLoadSuccess(StartupStatusEnum.AUTHENTICATED)
  ];
  const globalState = reproduceSequence(
    {} as GlobalState,
    appReducer,
    sequenceOfActions
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <Stack.Navigator screenOptions={{ animationEnabled: false }}>
        <Stack.Screen
          component={ItwIssuanceCredentialOfferIntroScreen}
          initialParams={{ itwCredentialOfferUri: T_CREDENTIAL_OFFER_URI }}
          name={ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO}
        />
        <Stack.Screen name={ITW_ROUTES.DISCOVERY.INFO}>
          {({ route }) => {
            onDiscoveryParams(route.params);
            return <Text testID="DiscoveryInfoScreenTestID" />;
          }}
        </Stack.Screen>
      </Stack.Navigator>
    ),
    TEST_NAVIGATOR_ROUTE,
    {},
    createStore(appReducer, globalState as any)
  );
};
