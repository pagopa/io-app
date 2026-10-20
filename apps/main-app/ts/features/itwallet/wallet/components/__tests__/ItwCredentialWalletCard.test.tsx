import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as bottomSheet from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import * as ingressSelectors from "../../../../ingress/store/selectors";
import * as eIDSelectors from "../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import {
  ItwCredentialWalletCard,
  ItwCredentialWalletCardProps
} from "../ItwCredentialWalletCard";

const mockNavigation = jest.fn();
const mockBottomSheetPresent = jest.fn();
const mockBottomSheetDismiss = jest.fn();
const mockToastError = jest.fn();

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual<typeof import("@io-app/design-system")>(
    "@io-app/design-system"
  ),
  useIOToast: () => ({ error: mockToastError })
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

describe("WrappedItwCredentialCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(({ component }) => ({
        present: mockBottomSheetPresent,
        dismiss: mockBottomSheetDismiss,
        bottomSheet: <>{component}</>
      }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should navigate to the credential details screen", () => {
    const tCredentialType = "mDL";

    const { getByTestId } = renderComponent({
      credentialType: tCredentialType
    });
    const button = getByTestId("ItwCredentialWalletCardTestID");
    fireEvent.press(button);

    expect(mockNavigation).toHaveBeenCalledWith("ITW_MAIN", {
      params: { credentialType: tCredentialType },
      screen: "ITW_PRESENTATION_CREDENTIAL_DETAIL"
    });
  });

  describe("credential upgrade", () => {
    const credentialProps = {
      credentialType: "mDL",
      issuedAt: "2025-09-01T08:00:00.000Z"
    };
    const connectivityScenarios = [
      { name: "online", isConnected: true },
      { name: "offline", isConnected: false }
    ];

    beforeEach(() => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(true);
      jest
        .spyOn(connectivitySelectors, "isConnectedSelector")
        .mockReturnValue(true);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(undefined);
      jest
        .spyOn(eIDSelectors, "itwCredentialsEidIssuedAtSelector")
        .mockReturnValue("2025-10-01T08:00:00.000Z");
    });

    it("should navigate to the credential upgrade flow after confirmation", () => {
      const { getByTestId, getByText } = renderComponent(credentialProps);
      fireEvent.press(getByTestId("ItwCredentialWalletCardTestID"));

      expect(mockBottomSheetPresent).toHaveBeenCalledTimes(1);
      expect(mockNavigation).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();

      fireEvent.press(
        getByText(
          I18n.t("features.itWallet.modal.credentialUpgrade.primaryButton")
        )
      );

      expect(mockBottomSheetDismiss).toHaveBeenCalledTimes(1);
      expect(mockNavigation).toHaveBeenCalledWith("ITW_MAIN", {
        params: {
          credentialType: credentialProps.credentialType,
          isUpgrade: true
        },
        screen: "ITW_ISSUANCE_CREDENTIAL_TRUST_ISSUER"
      });
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("should not navigate to the credential upgrade flow if device offline", () => {
      jest
        .spyOn(connectivitySelectors, "isConnectedSelector")
        .mockReturnValue(false);

      const { getByTestId, getByText } = renderComponent(credentialProps);
      fireEvent.press(getByTestId("ItwCredentialWalletCardTestID"));

      expect(mockBottomSheetPresent).toHaveBeenCalledTimes(1);
      expect(mockNavigation).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();

      fireEvent.press(
        getByText(
          I18n.t("features.itWallet.modal.credentialUpgrade.primaryButton")
        )
      );

      expect(mockBottomSheetDismiss).toHaveBeenCalledTimes(1);
      expect(mockNavigation).not.toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(
        I18n.t("global.offline.toast")
      );
    });

    it.each(connectivityScenarios)(
      "should navigate to credential details from the upgrade modal when $name",
      ({ isConnected }) => {
        jest
          .spyOn(connectivitySelectors, "isConnectedSelector")
          .mockReturnValue(isConnected);

        const { getByTestId, getByText } = renderComponent(credentialProps);
        fireEvent.press(getByTestId("ItwCredentialWalletCardTestID"));
        fireEvent.press(
          getByText(
            I18n.t("features.itWallet.modal.credentialUpgrade.secondaryButton")
          )
        );

        expect(mockBottomSheetDismiss).toHaveBeenCalledTimes(1);
        expect(mockNavigation).toHaveBeenCalledWith("ITW_MAIN", {
          params: { credentialType: credentialProps.credentialType },
          screen: "ITW_PRESENTATION_CREDENTIAL_DETAIL"
        });
        expect(mockToastError).not.toHaveBeenCalled();
      }
    );
  });

  const accessibilityScenarios = [
    {
      name: "PID, which renders the IT-Wallet ID logo",
      props: { credentialType: "pid", withItwDesign: true },
      expectedLabel: I18n.t("features.itWallet.credentialName.pid")
    },
    {
      name: "mDL",
      props: { credentialType: "mDL", withItwDesign: true },
      expectedLabel: I18n.t("features.itWallet.credentialName.mdl")
    }
  ];

  it.each(accessibilityScenarios)(
    "should expose the credential name as accessibility label ($name)",
    ({ props, expectedLabel }) => {
      const { getByTestId } = renderComponent(props);
      const button = getByTestId("ItwCredentialWalletCardTestID");

      expect(button.props.accessibilityLabel).toBe(expectedLabel);
    }
  );
});

const renderComponent = (props: ItwCredentialWalletCardProps) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <ItwCredentialWalletCard cardProps={props} />,
    "ANY_ROUTE",
    {},
    store
  );
};
