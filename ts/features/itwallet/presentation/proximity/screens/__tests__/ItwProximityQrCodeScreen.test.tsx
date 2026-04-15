import { createStore } from "redux";
import { createActor, StateFrom } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ItwPresentationTags } from "../../machine/tags";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { ItwProximityQrCodeScreen } from "../ItwProximityQrCodeScreen";

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
  | { machineState: "blocked" }
  | { machineState: "displayQrCode"; qrCodeString: string }
  | { machineState: "error" }
  | { machineState: "loading" };

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

    case "loading":
      return {
        ...initialSnapshot,
        value: { Presentation: "Starting" },
        tags: new Set([ItwPresentationTags.Loading]),
        context: { ...initialSnapshot.context }
      };
  }
};
