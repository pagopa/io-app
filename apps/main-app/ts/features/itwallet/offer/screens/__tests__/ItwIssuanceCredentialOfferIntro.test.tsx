import { createStackNavigator } from "@react-navigation/stack";
import I18n from "i18next";
import { Action, createStore } from "redux";
import { Text } from "react-native";
import * as appParamsList from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { appReducer } from "../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as credentialStatusUtils from "../../../common/utils/itwCredentialStatusUtils";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import {
  selectCredentialIntroContentOption,
  selectCredentialTypeOption,
  selectResolvedCredentialOfferOption
} from "../../../machine/credential/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialOfferIntroScreen } from "../ItwIssuanceCredentialOfferIntro";

jest.mock("../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

const T_CREDENTIAL_OFFER_URI =
  "openid-credential-offer://?credential_offer_uri=https://eaa.wallet.ipzs.it/offers/123";
const T_CREDENTIAL_TYPE = "education_degree";
const T_TRUST_ISSUER_BASE_URL = "https://eaa.wallet.ipzs.it";
const TEST_NAVIGATOR_ROUTE = "TEST_NAVIGATOR";

const Stack = createStackNavigator<ItwParamsList>();
const someOption = <T,>(value: T) => ({ _tag: "Some" as const, value });
const noneOption = { _tag: "None" as const };

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
      .mockReturnValue(false);
    jest
      .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: machineSend } as any);
    jest
      .spyOn(ItwCredentialIssuanceMachineContext, "useSelector")
      .mockImplementation(selector => {
        if (selector === selectResolvedCredentialOfferOption) {
          return someOption({
            offer: { credential_issuer: T_TRUST_ISSUER_BASE_URL },
            grantDetails: {
              authorizationCodeGrant: {
                authorizationServer: T_TRUST_ISSUER_BASE_URL,
                scope: T_CREDENTIAL_TYPE
              }
            }
          }) as any;
        }

        if (selector === selectCredentialTypeOption) {
          return someOption(T_CREDENTIAL_TYPE) as any;
        }

        if (selector === selectCredentialIntroContentOption) {
          return noneOption as any;
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
  });

  it("blocks the flow when the offered credential is already in the wallet and valid", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialSelector")
      .mockReturnValue((() => someOption({})) as any);
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
  });

  it("continues the flow when the stored credential is no longer valid", () => {
    jest
      .spyOn(credentialsSelectors, "itwCredentialSelector")
      .mockReturnValue((() => someOption({})) as any);
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
          name={ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO}
          component={ItwIssuanceCredentialOfferIntroScreen}
          initialParams={{ itwCredentialOfferUri: T_CREDENTIAL_OFFER_URI }}
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
