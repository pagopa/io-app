import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { ITW_PRIVACY_URL, ITW_TOS_URL } from "../../../../../urls";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as urlUtils from "../../../../../utils/url";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import * as identificationSelectors from "../../../identification/common/store/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { EidIssuanceLevel } from "../../../machine/eid/context";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { testEidIssuanceDeps } from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwDiscoveryInfoScreen,
  ItwDiscoveryInfoScreenNavigationParams,
  ItwDiscoveryInfoScreenProps
} from "../ItwDiscoveryInfoScreen";

const mockNavigate = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({
    ...jest.requireActual("@react-navigation/native").useNavigation(),
    navigate: mockNavigate
  })
}));

const credentialOfferUri = "openid-credential-offer://?credential_offer=test";

jest.mock("@io-app/design-system", () => {
  const actual = jest.requireActual("@io-app/design-system");
  const { View } = jest.requireActual("react-native");

  return {
    ...actual,
    ForceScrollDownView: ({ children }: import("react").PropsWithChildren) => (
      <View>{children}</View>
    )
  };
});

describe("ItwDiscoveryInfoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render ItwDiscoveryInfoComponent for level l3", () => {
    jest
      .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(true);
    const { getByTestId } = renderComponent("l3");
    expect(getByTestId("itwDiscoveryInfoComponentTestID")).toBeTruthy();
  });

  test.each([
    {
      name: "privacy policy",
      label: "Informativa Privacy",
      url: ITW_PRIVACY_URL
    },
    {
      name: "terms of service",
      label: "Termini e Condizioni d'uso",
      url: ITW_TOS_URL
    }
  ])("should open the IT-Wallet $name link for level l3", ({ label, url }) => {
    jest
      .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(true);
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(jest.fn());
    const { getByText } = renderComponent("l3");

    const link = getByText(label);
    expect(link.props.accessibilityRole).toBe("link");

    fireEvent.press(link);
    expect(openWebUrlSpy).toHaveBeenCalledWith(url, expect.any(Function));
  });

  it("should render ItwNfcNotSupportedComponent for level l3 when NFC is not supported", () => {
    jest
      .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(false);
    const { getByTestId } = renderComponent("l3");
    expect(getByTestId("itwnfcNotSupportedComponentTestID")).toBeTruthy();
  });

  it("should render ItwDiscoveryInfoFallbackComponent for level l2-fallback", () => {
    const { getByTestId } = renderComponent("l2-fallback");
    expect(getByTestId("itwDiscoveryInfoFallbackComponentTestID")).toBeTruthy();
  });

  test.each([undefined, "l2"] as const)(
    "should render ItwDiscoveryInfoLegacyComponent for level %s",
    level => {
      const { getByTestId } = renderComponent(level);
      expect(getByTestId("itwDiscoveryInfoLegacyComponentTestID")).toBeTruthy();
    }
  );

  describe("credential offer resume", () => {
    test.each([
      {
        name: "forwards an L2 credential offer for level l2",
        level: "l2",
        credentialType: CredentialType.DRIVING_LICENSE,
        expected: {
          credentialType: CredentialType.DRIVING_LICENSE,
          credentialOfferUri
        }
      },
      {
        name: "forwards an L2 credential offer for level l2-fallback",
        level: "l2-fallback",
        credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        expected: {
          credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
          credentialOfferUri
        }
      },
      {
        name: "drops a non-L2 credential offer for level l2",
        level: "l2",
        credentialType: CredentialType.EDUCATION_DEGREE,
        expected: { credentialType: undefined, credentialOfferUri: undefined }
      },
      {
        name: "drops a non-L2 credential offer for level l2-fallback",
        level: "l2-fallback",
        credentialType: CredentialType.EDUCATION_DEGREE,
        expected: { credentialType: undefined, credentialOfferUri: undefined }
      },
      {
        name: "drops an L2 credential without offer for level l2",
        level: "l2",
        credentialType: CredentialType.DRIVING_LICENSE,
        offerUri: undefined,
        expected: { credentialType: undefined, credentialOfferUri: undefined }
      },
      {
        name: "drops an L2 credential without offer for level l2-fallback",
        level: "l2-fallback",
        credentialType: CredentialType.DRIVING_LICENSE,
        offerUri: undefined,
        expected: { credentialType: undefined, credentialOfferUri: undefined }
      }
    ] as const)("$name", testCase => {
      const { level, credentialType, expected } = testCase;
      const offerUri =
        "offerUri" in testCase ? testCase.offerUri : credentialOfferUri;
      const send = jest.fn();
      jest
        .spyOn(ItwEidIssuanceMachineContext, "useActorRef")
        .mockReturnValue({ send } as unknown as ReturnType<
          typeof ItwEidIssuanceMachineContext.useActorRef
        >);

      renderComponent(level, {
        credentialType,
        credentialOfferUri: offerUri
      });

      expect(send).toHaveBeenCalledWith({
        type: "start",
        mode: "issuance",
        level,
        ...expected
      });
    });

    it("should forward the credential offer to the L2 fallback when NFC is not supported", () => {
      jest
        .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
        .mockReturnValue(false);
      jest
        .spyOn(preferencesSelectors, "itwIsActivationDisabledSelector")
        .mockReturnValue(false);
      jest
        .spyOn(ItwCredentialIssuanceMachineContext, "useActorRef")
        .mockReturnValue({ send: jest.fn() } as unknown as ReturnType<
          typeof ItwCredentialIssuanceMachineContext.useActorRef
        >);

      const { getByText } = renderComponent("l3", {
        credentialType: CredentialType.DRIVING_LICENSE,
        credentialOfferUri
      });

      fireEvent.press(
        getByText(
          I18n.t(
            "features.itWallet.discovery.continueWithoutItw.actions.continue"
          )
        )
      );

      expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.DISCOVERY.INFO,
        params: {
          level: "l2-fallback",
          credentialType: CredentialType.DRIVING_LICENSE,
          credentialOfferUri
        }
      });
    });
  });
});

const renderComponent = (
  level: EidIssuanceLevel | undefined,
  params: Omit<ItwDiscoveryInfoScreenNavigationParams, "level"> = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (props: ItwDiscoveryInfoScreenProps) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToTosScreen: () => undefined,
        trackIntroScreen: jest.fn()
      }
    });

    return (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{ input: { deps: testEidIssuanceDeps() } }}
      >
        <ItwDiscoveryInfoScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.DISCOVERY.INFO,
    { level, ...params },
    store
  );
};
