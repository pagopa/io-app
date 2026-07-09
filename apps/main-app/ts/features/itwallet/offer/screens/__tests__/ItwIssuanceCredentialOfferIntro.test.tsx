import { createStackNavigator } from "@react-navigation/stack";
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
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as catalogSelectors from "../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import {
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
      .spyOn(catalogSelectors, "itwCredentialIntroContentSelector")
      .mockReturnValue(() => undefined);
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
