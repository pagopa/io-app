import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../../store/actions/backendStatus";
import { appReducer } from "../../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../../connectivity/store/selectors";
import { FIMS_ROUTES } from "../../../../../fims/common/navigation";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import * as itwSelectors from "../../../../common/store/selectors";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import * as catalogueSelectors from "../../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as proximitySelectors from "../../../proximity/store/selectors/credentials";
import { ItwPresentationCredentialDetail } from "../ItwPresentationCredentialDetailScreen";

const mockNavigate = jest.fn();
const mockGetState = jest.fn();
const mockTrackOpportunities = jest.fn();
const mockToastError = jest.fn();
const serviceId = "01KTXJ47AAJMZFRJPA4V4TX5D0";

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList"),
  useIONavigation: () => ({
    navigate: mockNavigate,
    getState: mockGetState
  })
}));

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
  ),
  useIOToast: () => ({ error: mockToastError })
}));

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackWalletCredentialOpportunities: (credential: string) =>
    mockTrackOpportunities(credential)
}));

jest.mock("../../components/ItwPresentationDetailsFooter", () => ({
  ItwPresentationDetailsFooter: () => null
}));
jest.mock("../../components/ItwPresentationDetailsHeader", () => ({
  ItwPresentationDetailsHeader: () => null,
  ItwPresentationDetailsHeaderLegacy: () => null
}));
jest.mock("../../components/ItwPresentationAdditionalInfoSection", () => ({
  ItwPresentationAdditionalInfoSection: () => null
}));
jest.mock("../../components/ItwPresentationCredentialStatusAlert", () => ({
  ItwPresentationCredentialStatusAlert: () => null
}));
jest.mock("../../components/ItwPresentationCredentialInfoAlert", () => ({
  ItwPresentationCredentialInfoAlert: () => null
}));
jest.mock("../../components/ItwPresentationClaimsSection", () => ({
  ItwPresentationClaimsSection: () => null
}));
jest.mock("../../../../trustmark/components/ItwCredentialTrustmark", () => ({
  ItwCredentialTrustmark: () => null
}));

const walletScenarios = [
  {
    name: "Documenti su IO",
    credential: ItwStoredCredentialsMocks.dc,
    isL3: false,
    analyticsCredential: "ITW_CED_V2"
  },
  {
    name: "IT-Wallet",
    credential: ItwStoredCredentialsMocks.L3.dc,
    isL3: true,
    analyticsCredential: "ITW_CED_V3"
  }
];

const blockedScenarios = [
  {
    name: "offline",
    isConnected: false,
    offlineReason: undefined
  },
  {
    name: "connectivity unknown",
    isConnected: undefined,
    offlineReason: undefined
  },
  {
    name: "session expired while connected",
    isConnected: true,
    offlineReason: OfflineAccessReasonEnum.SESSION_EXPIRED
  }
];

const opportunitiesLabel = () =>
  I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.discoverOpportunities"
  );

describe("credential opportunities CTA", () => {
  beforeEach(() => {
    mockGetState.mockReturnValue({
      index: 0,
      routes: [{ name: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL }]
    });
    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);
    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(catalogueSelectors, "itwDiscoverMoreCEDSelector")
      .mockReturnValue(true);
    jest
      .spyOn(itwSelectors, "isItwProximityEnabledSelector")
      .mockReturnValue(true);
    jest
      .spyOn(proximitySelectors, "isPresentableCredentialSelector")
      .mockReturnValue(() => true);
    jest
      .spyOn(credentialSelectors, "itwCredentialStatusSelector")
      .mockReturnValue({ status: "valid" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test.each(walletScenarios)(
    "tracks the $name click before starting FIMS with the CDN configuration",
    ({ credential, isL3, analyticsCredential }) => {
      const { getByText } = renderComponent(credential, isL3);

      fireEvent.press(getByText(opportunitiesLabel()));

      expect(mockTrackOpportunities).toHaveBeenCalledTimes(1);
      expect(mockTrackOpportunities).toHaveBeenCalledWith(analyticsCredential);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(FIMS_ROUTES.MAIN, {
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaText: opportunitiesLabel(),
          ctaUrl: "https://api.ced.pagopa.it/api/ced-card/v1/fauth",
          source: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
          serviceId,
          serviceName: undefined,
          organizationName: undefined,
          organizationFiscalCode: undefined,
          ephemeralSessionOniOS: true
        }
      });
      expect(mockTrackOpportunities.mock.invocationCallOrder[0]).toBeLessThan(
        mockNavigate.mock.invocationCallOrder[0]
      );
      expect(mockToastError).not.toHaveBeenCalled();
    }
  );

  test.each(blockedScenarios)(
    "tracks the click and shows a toast without starting FIMS when $name",
    ({ isConnected, offlineReason }) => {
      jest
        .spyOn(connectivitySelectors, "isConnectedSelector")
        .mockReturnValue(isConnected);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineReason);
      const { getByText } = renderComponent(ItwStoredCredentialsMocks.dc);

      fireEvent.press(getByText(opportunitiesLabel()));

      expect(mockTrackOpportunities).toHaveBeenCalledTimes(1);
      expect(mockTrackOpportunities).toHaveBeenCalledWith("ITW_CED_V2");
      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith(
        I18n.t("global.offline.toast")
      );
      expect(mockTrackOpportunities.mock.invocationCallOrder[0]).toBeLessThan(
        mockToastError.mock.invocationCallOrder[0]
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  );

  test("hides the CTA when the CED opportunities flag is disabled", () => {
    jest
      .spyOn(catalogueSelectors, "itwDiscoverMoreCEDSelector")
      .mockReturnValue(false);
    const { queryByText } = renderComponent(ItwStoredCredentialsMocks.dc);

    expect(queryByText(opportunitiesLabel())).toBeNull();
  });

  test("tracks the click without starting FIMS when the CDN configuration is missing", () => {
    const { getByText } = renderComponent(
      ItwStoredCredentialsMocks.dc,
      false,
      false
    );

    fireEvent.press(getByText(opportunitiesLabel()));

    expect(mockTrackOpportunities).toHaveBeenCalledTimes(1);
    expect(mockTrackOpportunities).toHaveBeenCalledWith("ITW_CED_V2");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  test.each([
    { name: "driving license", credential: ItwStoredCredentialsMocks.mdl },
    { name: "health card", credential: ItwStoredCredentialsMocks.ts }
  ])("hides the CTA for the $name", ({ credential }) => {
    const { queryByText } = renderComponent(credential);

    expect(queryByText(opportunitiesLabel())).toBeNull();
  });
});

const renderComponent = (
  credential: CredentialMetadata,
  isL3 = false,
  hasServiceConfiguration = true
) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(isL3);
  const initialState = appReducer(
    appReducer(undefined, applicationChangeState("active")),
    backendStatusLoadSuccess({
      ...baseRawBackendStatus,
      config: {
        ...baseRawBackendStatus.config,
        fims: {
          ...baseRawBackendStatus.config.fims,
          services: hasServiceConfiguration
            ? [{ configuration_id: "ced-opportunities", service_id: serviceId }]
            : [],
          iOSCookieDisabledServiceIds: [serviceId]
        }
      }
    })
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwPresentationCredentialDetail credential={credential} />,
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, initialState as any)
  );
};
