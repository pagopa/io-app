import I18n from "i18next";
import { createStore } from "redux";
import { createActor, StateFrom } from "xstate";

import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as remoteConfig from "../../../../common/store/selectors/remoteConfig";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import { trackItwProximityQrCode } from "../../analytics";
import { ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ItwPresentationTags } from "../../machine/tags";
import { ItwProximityParamsList } from "../../navigation/ItwProximityParamsList";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import {
  ItwProximityPresentmentScreen,
  ItwProximityPresentmentScreenNavigationParams
} from "../ItwProximityPresentmentScreen";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn()
}));

const mockQRCode = jest.fn();
jest.mock("react-native-qrcode-skia", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: (props: unknown) => {
      mockQRCode(props);
      return React.createElement("View", { testID: "qrcode" });
    }
  };
});

const mockShouldShowExpiredProximityCredentialsBannerSelector = jest.fn(
  () => false
);
jest.mock("../../store/selectors/credentials", () => ({
  shouldShowExpiredProximityCredentialsBannerSelector: () =>
    mockShouldShowExpiredProximityCredentialsBannerSelector(),
  itwPresentableCredentialsByDocTypeSelector: () => ({})
}));

describe("ItwProximityPresentmentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(remoteConfig, "isItwProximityNfcMinAppVersionSupportedSelector")
      .mockReturnValue(true);
  });

  afterEach(() => jest.restoreAllMocks());

  it("should render loading skeleton when machine is loading", () => {
    expect(
      renderComponent({ machineState: "loading" }, { source: "WALLET_HOME" })
    ).toMatchSnapshot();
  });

  it("should render QR code when ready", () => {
    const component = renderComponent(
      {
        machineState: "displayQrCode",
        qrCodeString: "mock-qr-code-string"
      },
      { source: "WALLET_HOME" }
    );

    expect(
      component.getByLabelText(
        "Immagine del codice QR da mostrare a chi verifica i documenti digitali"
      )
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should pass stable shape and logo props so QRCode does not regenerate its path", () => {
    const options = {
      machineState: "displayQrCode",
      qrCodeString: "mock-qr-code-string"
    } as const;
    renderComponent(options, { source: "WALLET_HOME" });
    renderComponent(options, { source: "WALLET_HOME" });

    const [first, last] = [
      mockQRCode.mock.calls[0][0],
      mockQRCode.mock.calls.at(-1)[0]
    ];
    expect(mockQRCode.mock.calls.length).toBeGreaterThan(1);
    expect(last.shapeOptions).toBe(first.shapeOptions);
    expect(last.logo).toBe(first.logo);
  });

  it("should render error state when QR code generation fails", () => {
    expect(
      renderComponent({ machineState: "error" }, { source: "WALLET_HOME" })
    ).toMatchSnapshot();
  });

  it("should track qr code screen view with valid status", () => {
    renderComponent(
      {
        machineState: "displayQrCode",
        qrCodeString: "mock-qr-code-string"
      },
      { source: "WALLET_HOME" }
    );

    expect(trackItwProximityQrCode).toHaveBeenCalledTimes(1);
    expect(trackItwProximityQrCode).toHaveBeenCalledWith({
      source: "WALLET_HOME",
      qr_code_status: "valid"
    });
  });

  it("should track qr code screen view with generation_failed status", () => {
    renderComponent({ machineState: "error" }, { source: "WALLET_HOME" });

    expect(trackItwProximityQrCode).toHaveBeenCalledTimes(1);
    expect(trackItwProximityQrCode).toHaveBeenCalledWith({
      source: "WALLET_HOME",
      qr_code_status: "generation_failed"
    });
  });

  describe("when credentials are expired", () => {
    beforeEach(() => {
      mockShouldShowExpiredProximityCredentialsBannerSelector.mockReturnValue(
        true
      );
    });

    afterEach(() => {
      mockShouldShowExpiredProximityCredentialsBannerSelector.mockReturnValue(
        false
      );
    });

    it("should render QR code with alert banner", () => {
      expect(
        renderComponent(
          {
            machineState: "displayQrCode",
            qrCodeString: "mock-qr-code-string"
          },
          { source: "WALLET_HOME" }
        )
      ).toMatchSnapshot();
    });

    it("should track qr code screen view with PID_expired status", () => {
      renderComponent(
        { machineState: "displayQrCode", qrCodeString: "mock-qr-code-string" },
        { source: "WALLET_HOME" }
      );

      expect(trackItwProximityQrCode).toHaveBeenCalledTimes(1);
      expect(trackItwProximityQrCode).toHaveBeenCalledWith({
        source: "WALLET_HOME",
        qr_code_status: "PID_expired"
      });
    });
  });

  const nfcScenarios = [
    { name: "enabled", enabled: true },
    { name: "disabled", enabled: false }
  ];

  it.each(nfcScenarios)(
    "renders the NFC section only when the feature flag is enabled ($name)",
    ({ enabled }) => {
      jest
        .mocked(remoteConfig.isItwProximityNfcMinAppVersionSupportedSelector)
        .mockReturnValue(enabled);
      const component = renderComponent(
        {
          machineState: "displayQrCode",
          qrCodeString: "mock-qr-code-string"
        },
        { source: "WALLET_HOME" }
      );

      expect(component.queryByTestId("itwNfcSectionTestID") !== null).toBe(
        enabled
      );
      expect(
        component.queryByRole("button", {
          name: I18n.t(
            "features.itWallet.presentation.proximity.engagement.nfc.action"
          )
        }) !== null
      ).toBe(enabled);
      expect(
        component.queryByText(
          I18n.t("features.itWallet.presentation.proximity.engagement.nfc.or")
        ) !== null
      ).toBe(enabled);
      expect(
        component.getByLabelText(
          I18n.t(
            "features.itWallet.presentation.proximity.engagement.qrCode.accessibilityLabel"
          )
        )
      ).toBeTruthy();
    }
  );
});

type RenderOptions =
  | { machineState: "displayQrCode"; qrCodeString: string }
  | { machineState: "error" }
  | { machineState: "loading" };

const renderComponent = (
  options: RenderOptions,
  routeParams: ItwProximityPresentmentScreenNavigationParams
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const initialSnapshot = createActor(itwProximityMachine, {
    input: { deps: testProximityDeps({ store }) }
  }).getSnapshot();

  const snapshot = buildSnapshot(initialSnapshot, options);

  const mockNavigation = new Proxy(
    {},
    {
      get: () => jest.fn()
    }
  ) as unknown as IOStackNavigationProp<
    ItwProximityParamsList,
    "ITW_PROXIMITY_PRESENTMENT"
  >;

  const route = {
    key: "ITW_PROXIMITY_PRESENTMENT",
    name: ITW_PROXIMITY_ROUTES.PRESENTMENT,
    params: routeParams
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityPresentmentScreen
          navigation={mockNavigation}
          route={route}
        />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_PROXIMITY_ROUTES.PRESENTMENT,
    {},
    store
  );
};

const buildSnapshot = (
  initialSnapshot: StateFrom<typeof itwProximityMachine>,
  options: RenderOptions
): StateFrom<typeof itwProximityMachine> => {
  switch (options.machineState) {
    case "displayQrCode":
      return {
        ...initialSnapshot,
        value: { Presentment: "AwaitingConnection" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          qrCodeString: options.qrCodeString
        }
      };

    case "error":
      return {
        ...initialSnapshot,
        value: { Presentment: "Starting" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: {
          ...initialSnapshot.context,
          failure: {
            type: ProximityFailureType.UNEXPECTED,
            reason: new Error("test error")
          }
        }
      };

    case "loading":
      return {
        ...initialSnapshot,
        value: { Presentment: "Starting" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: { ...initialSnapshot.context }
      };
  }
};
