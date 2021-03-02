import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import BancomatInformation from "../BancomatInformation";

const mockPresentFn = jest.fn();
jest.mock("../../utils/bancomatInformationBottomSheet", () => ({
  __esModule: true,
  default: () => ({ present: mockPresentFn })
}));

describe("BancomatInformation component", () => {
  it("should show the InternationalCircuitIconsBar", () => {
    const onAddPaymentMethod = jest.fn();
    const component = getComponent(onAddPaymentMethod);
    const internationalCircuitIconsBar = component.queryByTestId(
      "internationalCircuitIconsBar"
    );

    expect(internationalCircuitIconsBar).not.toBeNull();
  });

  it("should call the present function when click on notice icon", () => {
    const onAddPaymentMethod = jest.fn();
    const component = getComponent(onAddPaymentMethod);
    const ioNoticeIcon = component.queryByTestId("noticeIconFont");

    expect(ioNoticeIcon).not.toBeNull();

    if (ioNoticeIcon !== null) {
      fireEvent.press(ioNoticeIcon);
      expect(mockPresentFn).toHaveBeenCalledTimes(1);
    }
  });
  it("should call the onAddPaymentMethod function when click on addPaymentMethod button", () => {
    const onAddPaymentMethod = jest.fn();
    const component = getComponent(onAddPaymentMethod);
    const addPaymentMethodButton = component.queryByTestId(
      "addPaymentMethodButton"
    );

    expect(addPaymentMethodButton).not.toBeNull();

    if (addPaymentMethodButton !== null) {
      fireEvent.press(addPaymentMethodButton);
      expect(onAddPaymentMethod).toHaveBeenCalledTimes(1);
    }
  });
});

const getComponent = (onAddPaymentMethod: () => void) => {
  const mockStore = configureMockStore();

  const store: ReturnType<typeof mockStore> = mockStore();
  return render(
    <Provider store={store}>
      <BancomatInformation onAddPaymentMethod={onAddPaymentMethod} />
    </Provider>
  );
};
