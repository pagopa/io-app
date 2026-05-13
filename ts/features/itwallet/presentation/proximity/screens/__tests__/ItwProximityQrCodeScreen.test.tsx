import { createStore } from "redux";
import { createActor, StateFrom } from "xstate";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { trackItwProximityQrCode } from "../../analytics";
import { ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ItwPresentationTags } from "../../machine/tags";
import { ItwProximityParamsList } from "../../navigation/ItwProximityParamsList";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import {
  ItwProximityQrCodeScreen,
  ItwProximityQrCodeScreenNavigationParams
} from "../ItwProximityNfcPresentmentScreen";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn()
}));

jest.mock("react-native-qrcode-skia", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: () => React.createElement("View", { testID: "qrcode" })
  };
});

const mockShouldBlockProximityQrCodeSelector = jest.fn(() => false);
jest.mock("../../store/selectors/credentials", () => ({
  shouldBlockProximityQrCodeSelector: () =>
    mockShouldBlockProximityQrCodeSelector()
}));

describe("ItwProximityQrCodeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render loading skeleton when machine is loading", () => {
    expect(
      renderComponent({ machineState: "loading" }, { source: "WALLET_HOME" })
    ).toMatchSnapshot();
  });

  it("should render QR code when ready", () => {
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
      mockShouldBlockProximityQrCodeSelector.mockReturnValue(true);
    });

    afterEach(() => {
      mockShouldBlockProximityQrCodeSelector.mockReturnValue(false);
    });

    it("should render blocked state with alert banner", () => {
      expect(
        renderComponent({ machineState: "blocked" }, { source: "WALLET_HOME" })
      ).toMatchSnapshot();
    });

    it("should track qr code screen view with PID_expired status", () => {
      renderComponent({ machineState: "blocked" }, { source: "WALLET_HOME" });

      expect(trackItwProximityQrCode).toHaveBeenCalledTimes(1);
      expect(trackItwProximityQrCode).toHaveBeenCalledWith({
        source: "WALLET_HOME",
        qr_code_status: "PID_expired"
      });
    });
  });
});

type RenderOptions =
  | { machineState: "loading" }
  | { machineState: "displayQrCode"; qrCodeString: string }
  | { machineState: "error" }
  | { machineState: "blocked" };

const renderComponent = (
  options: RenderOptions,
  routeParams: ItwProximityQrCodeScreenNavigationParams
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

  const snapshot = buildSnapshot(initialSnapshot, options);

  const mockNavigation = new Proxy(
    {},
    {
      get: () => jest.fn()
    }
  ) as unknown as IOStackNavigationProp<
    ItwProximityParamsList,
    "ITW_PROXIMITY_QR_CODE"
  >;

  const route = {
    key: "ITW_PROXIMITY_QR_CODE",
    name: ITW_PROXIMITY_ROUTES.QR_CODE,
    params: routeParams
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityQrCodeScreen navigation={mockNavigation} route={route} />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_PROXIMITY_ROUTES.QR_CODE,
    {},
    createStore(appReducer, initialState as any)
  );
};

const buildSnapshot = (
  initialSnapshot: StateFrom<typeof itwProximityMachine>,
  options: RenderOptions
): StateFrom<typeof itwProximityMachine> => {
  switch (options.machineState) {
    case "loading":
      return {
        ...initialSnapshot,
        value: { Presentation: "Starting" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: { ...initialSnapshot.context }
      };

    case "displayQrCode":
      return {
        ...initialSnapshot,
        value: { Presentation: "DisplayQrCode" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          qrCodeString: options.qrCodeString
        }
      };

    case "error":
      return {
        ...initialSnapshot,
        value: { Presentation: "Starting" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: {
          ...initialSnapshot.context,
          failure: {
            type: ProximityFailureType.UNEXPECTED,
            reason: new Error("test error")
          }
        }
      };

    case "blocked":
      return {
        ...initialSnapshot,
        value: { Presentation: "DisplayQrCode" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          qrCodeString: "mock-qr-code-string"
        }
      };
  }
};
