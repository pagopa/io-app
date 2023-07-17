import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../i18n";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";

jest.mock("../../hooks/useIOBarcodeScanner", () => ({
  useIOBarcodeScanner: jest.fn()
}));

import {
  IOBarcodeScanner,
  useIOBarcodeScanner
} from "../../hooks/useIOBarcodeScanner";
import { BarcodeScanBaseScreenComponent } from "../BarcodeScanBaseScreenComponent";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";

const mockCameraComponent = <View testID="cameraComponentTestID" />;

(useIOBarcodeScanner as jest.Mock).mockImplementation(
  (): IOBarcodeScanner => ({
    cameraComponent: mockCameraComponent,
    cameraPermissionStatus: "authorized",
    requestCameraPermission: jest.fn(),
    openCameraSettings: jest.fn()
  })
);

describe("Test BarcodeScanBaseScreenComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make a correct first render", () => {
    const { component } = renderComponent();

    expect(component).toBeTruthy();
  });

  it("should display the camera component", () => {
    const { component } = renderComponent();

    expect(component.queryByTestId("cameraComponentTestID")).toBeTruthy();
  });

  it("should display the undefined camera permissions view and let user grant permissions", () => {
    const mockRequestCameraPermission = jest.fn();
    const mockOpenCameraSettings = jest.fn();

    (useIOBarcodeScanner as jest.Mock).mockImplementationOnce(
      (): IOBarcodeScanner => ({
        cameraComponent: <View testID="cameraComponentTestID" />,
        cameraPermissionStatus: "not-determined",
        requestCameraPermission: mockRequestCameraPermission,
        openCameraSettings: mockOpenCameraSettings
      })
    );

    const { component } = renderComponent();

    expect(component.queryByTestId("cameraComponentTestID")).toBeFalsy();

    expect(
      component.queryByText(I18n.t("barcodeScan.permissions.undefined.title"))
    ).toBeTruthy();

    expect(
      component.queryByText(I18n.t("barcodeScan.permissions.undefined.label"))
    ).toBeTruthy();

    const buttonComponent = component.getByText(
      I18n.t("barcodeScan.permissions.undefined.action")
    );

    expect(buttonComponent).toBeTruthy();

    fireEvent(buttonComponent, "onPress");

    expect(mockRequestCameraPermission).toHaveBeenCalledTimes(1);
    expect(mockOpenCameraSettings).toHaveBeenCalledTimes(0);
  });

  it("should display the denied camera permissions view and let user grant permissions", () => {
    const mockRequestCameraPermission = jest.fn();
    const mockOpenCameraSettings = jest.fn();

    (useIOBarcodeScanner as jest.Mock).mockImplementationOnce(
      (): IOBarcodeScanner => ({
        cameraComponent: <View testID="cameraComponentTestID" />,
        cameraPermissionStatus: "restricted",
        requestCameraPermission: mockRequestCameraPermission,
        openCameraSettings: mockOpenCameraSettings
      })
    );

    const { component } = renderComponent();

    expect(component.queryByTestId("cameraComponentTestID")).toBeFalsy();

    expect(
      component.queryByText(I18n.t("barcodeScan.permissions.denied.title"))
    ).toBeTruthy();

    expect(
      component.queryByText(I18n.t("barcodeScan.permissions.denied.label"))
    ).toBeTruthy();

    const buttonComponent = component.getByText(
      I18n.t("barcodeScan.permissions.denied.action")
    );

    expect(buttonComponent).toBeTruthy();

    fireEvent(buttonComponent, "onPress");

    expect(mockRequestCameraPermission).toHaveBeenCalledTimes(0);
    expect(mockOpenCameraSettings).toHaveBeenCalledTimes(1);
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
      () => (
        <BarcodeScanBaseScreenComponent
          onBarcodeSuccess={() => null}
          onBarcodeError={() => null}
          onManualInputPressed={() => null}
        />
      ),
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
};
