import { createActor, StateFrom } from "xstate";
import { createStore } from "redux";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ItwProximityQrCodeScreen } from "../ItwProximityQrCodeScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ItwPresentationTags } from "../../machine/tags";

jest.mock("react-native-qrcode-skia", () => {
  const React = jest.requireActual("react");
  return {
    __esModule: true,
    default: () => React.createElement("View", { testID: "qrcode" })
  };
});

const mockShouldBlockProximityQrCodeSelector = jest.fn(() => false);
jest.mock("../../store/selectors", () => ({
  shouldBlockProximityQrCodeSelector: () =>
    mockShouldBlockProximityQrCodeSelector()
}));

describe("ItwProximityQrCodeScreen", () => {
  it("should render loading skeleton when machine is loading", () => {
    expect(renderComponent({ machineState: "loading" })).toMatchSnapshot();
  });

  it("should render QR code when ready", () => {
    expect(
      renderComponent({
        machineState: "displayQrCode",
        qrCodeString: "mock-qr-code-string"
      })
    ).toMatchSnapshot();
  });

  it("should render error state when QR code generation fails", () => {
    expect(renderComponent({ machineState: "error" })).toMatchSnapshot();
  });

  describe("when credentials are expired", () => {
    beforeEach(() => {
      mockShouldBlockProximityQrCodeSelector.mockReturnValue(true);
    });

    afterEach(() => {
      mockShouldBlockProximityQrCodeSelector.mockReturnValue(false);
    });

    it("should render blocked state with alert banner", () => {
      expect(renderComponent({ machineState: "blocked" })).toMatchSnapshot();
    });
  });
});

type RenderOptions =
  | { machineState: "loading" }
  | { machineState: "displayQrCode"; qrCodeString: string }
  | { machineState: "error" }
  | { machineState: "blocked" };

const renderComponent = (options: RenderOptions) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

  const snapshot = buildSnapshot(initialSnapshot, options);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityQrCodeScreen />
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
        value: { GenerateQRCode: "StartingProximityFlow" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: { ...initialSnapshot.context }
      };

    case "displayQrCode":
      return {
        ...initialSnapshot,
        value: { DeviceCommunication: "DisplayQrCode" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          qrCodeString: options.qrCodeString
        }
      };

    case "error":
      return {
        ...initialSnapshot,
        value: { GenerateQRCode: "QRCodeGenerationError" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          isQRCodeGenerationError: true
        }
      };

    case "blocked":
      return {
        ...initialSnapshot,
        value: { DeviceCommunication: "DisplayQrCode" },
        tags: new Set([ItwPresentationTags.Presenting]),
        context: {
          ...initialSnapshot.context,
          qrCodeString: "mock-qr-code-string"
        }
      };
  }
};
