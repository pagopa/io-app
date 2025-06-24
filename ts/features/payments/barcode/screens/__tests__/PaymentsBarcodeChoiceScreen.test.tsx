import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as analytics from "../../../../barcode/analytics";
import * as usePagoPaPaymentHook from "../../../checkout/hooks/usePagoPaPayment";
import { PaymentsBarcodeRoutes } from "../../navigation/routes";
import { PaymentsBarcodeChoiceScreen } from "../PaymentsBarcodeChoiceScreen";

const mockStartPaymentFlowWithRptId = jest.fn();
jest.spyOn(usePagoPaPaymentHook, "usePagoPaPayment").mockReturnValue({
  startPaymentFlowWithRptId: mockStartPaymentFlowWithRptId,
  startPaymentFlow: jest.fn(),
  startPaymentFlowWithData: jest.fn()
});

const mockTrackScreenView = jest
  .spyOn(analytics, "trackBarcodeMultipleCodesScreenView")
  .mockImplementation(jest.fn());

const mockTrackSelection = jest
  .spyOn(analytics, "trackBarcodeMultipleCodesSelection")
  .mockImplementation(jest.fn());

const barcodes = [
  {
    type: "PAGOPA",
    format: "QR_CODE",
    data: "some-data",
    amount: "50.00",
    rptId: {
      organizationFiscalCode: "12345678901",
      paymentNoticeNumber: "123456789012345678"
    }
  },
  {
    type: "PAGOPA",
    format: "DATA_MATRIX",
    data: "some-other-data",
    amount: "100.00",
    rptId: {
      organizationFiscalCode: "12345678902",
      paymentNoticeNumber: "123456789012345679"
    }
  }
];

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    PaymentsBarcodeChoiceScreen,
    PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE,
    {
      barcodes
    },
    store
  );
};

describe("PaymentsBarcodeChoiceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders barcodes and tracks screen view", () => {
    const { getAllByText } = renderComponent();

    expect(getAllByText("12345678901")).toHaveLength(1);
    expect(mockTrackScreenView).toHaveBeenCalled();
  });

  it("handles barcode selection with correct analytics and payment flow", () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText("12345678901"));

    expect(mockTrackSelection).toHaveBeenCalled();
    expect(mockStartPaymentFlowWithRptId).toHaveBeenCalledWith(
      {
        organizationFiscalCode: "12345678901",
        paymentNoticeNumber: "123456789012345678"
      },
      {
        onSuccess: "showTransaction",
        startOrigin: "qrcode_scan"
      }
    );
  });
});
