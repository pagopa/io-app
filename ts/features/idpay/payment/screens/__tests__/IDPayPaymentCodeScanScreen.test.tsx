import React from "react";
import { View } from "react-native";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { IOBarcodeScanner } from "../../components/BarcodeScanner";
import { IDPayPaymentRoutes } from "../../navigation/navigator";
import { IDPayPaymentCodeScanScreen } from "../IDPayPaymentCodeScanScreen";

const mockCameraComponent = <View testID="cameraComponentTestID" />;

const mockUseIOBarcodeScanner = jest.fn<IOBarcodeScanner, any>(() => ({
  cameraComponent: mockCameraComponent,
  cameraPermissionStatus: "authorized",
  requestCameraPermission: jest.fn(),
  openCameraSettings: jest.fn()
}));

jest.mock("../../components/BarcodeScanner", () => ({
  useIOBarcodeScanner: mockUseIOBarcodeScanner
}));

describe("Test IDPayPaymentCodeScanScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make a correct first render", () => {
    const { component } = renderComponent();

    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <IDPayPaymentCodeScanScreen />,
      IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN,
      {},
      store
    ),
    store
  };
};
