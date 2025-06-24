import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { BarcodeScanBaseScreenComponent } from "../../../../barcode";
import { PaymentsCheckoutRoutes } from "../../../checkout/navigation/routes";
import { PaymentsBarcodeRoutes } from "../../navigation/routes";
import { PaymentsBarcodeScanScreen } from "../PaymentsBarcodeScanScreen";
import * as analytics from "../../../../barcode/analytics";
import * as mixpanel from "../../../../../mixpanel";
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      addListener: jest.fn(() => jest.fn())
    })
  };
});

jest.mock("react-native-vision-camera", () => ({
  useCameraDevice: jest.fn(() => ({
    id: "mocked-device",
    name: "Mocked Camera",
    position: "back",
    devices: [],
    physicalDevices: ["wide-angle-camera"]
  })),
  useCameraDevices: jest.fn(() => ({
    back: { id: "mocked-device", name: "Mocked Camera", position: "back" },
    front: {
      id: "mocked-device-front",
      name: "Mocked Front Camera",
      position: "front"
    }
  })),
  useCodeScanner: jest.fn(() => ({})),
  Camera: {
    getCameraPermissionStatus: jest.fn(() => "authorized")
  }
}));

const mockStartPaymentFlowWithRptId = jest.fn();

jest.mock("../../../checkout/hooks/usePagoPaPayment", () => ({
  usePagoPaPayment: () => ({
    startPaymentFlowWithRptId: mockStartPaymentFlowWithRptId
  })
}));

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    PaymentsBarcodeScanScreen,
    PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN,
    {},
    store
  );
};

describe("PaymentsBarcodeScanScreen", () => {
  it("should render correctly", () => {
    const component = renderComponent();
    expect(component).toBeDefined();
  });

  it("navigates to barcode choice screen when multiple PAGOPA barcodes are found", () => {
    const component = renderComponent();

    const barcodes = [
      { type: "PAGOPA", format: "QR_CODE", rptId: "001" },
      { type: "PAGOPA", format: "QR_CODE", rptId: "002" }
    ];

    component
      .UNSAFE_getByType(BarcodeScanBaseScreenComponent)
      .props.onBarcodeSuccess(barcodes, "camera");

    expect(mockNavigate).toHaveBeenCalledWith(
      PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR,
      {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE,
        params: { barcodes }
      }
    );
  });

  it("starts payment flow with QR code", () => {
    const component = renderComponent();

    const barcodes = [{ type: "PAGOPA", format: "QR_CODE", rptId: "123" }];

    component
      .UNSAFE_getByType(BarcodeScanBaseScreenComponent)
      .props.onBarcodeSuccess(barcodes, "camera");

    expect(mockStartPaymentFlowWithRptId).toHaveBeenCalledWith("123", {
      onSuccess: "showTransaction",
      startOrigin: "qrcode_scan"
    });
  });

  it("tracks failure and shows toast on unknown content DATA_MATRIX error", () => {
    const trackFailureSpy = jest
      .spyOn(analytics, "trackBarcodeScanFailure")
      .mockImplementation(jest.fn());
    const mixpanelSpy = jest
      .spyOn(mixpanel, "mixpanelTrack")
      .mockImplementation(jest.fn());

    const component = renderComponent();

    const failure = { reason: "UNKNOWN_CONTENT", format: "DATA_MATRIX" };

    component
      .UNSAFE_getByType(BarcodeScanBaseScreenComponent)
      .props.onBarcodeError(failure);

    expect(trackFailureSpy).toHaveBeenCalledWith("avviso", failure);
    expect(mixpanelSpy).toHaveBeenCalledWith(
      "WALLET_SCAN_POSTE_DATAMATRIX_FAILURE"
    );

    // Optional: restore the original implementations
    trackFailureSpy.mockRestore();
    mixpanelSpy.mockRestore();
  });

  it("navigates to manual input screen on manual input press", () => {
    const component = renderComponent();

    component
      .UNSAFE_getByType(BarcodeScanBaseScreenComponent)
      .props.onManualInputPressed();

    expect(mockNavigate).toHaveBeenCalledWith(
      PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR,
      {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
      }
    );
  });
});
