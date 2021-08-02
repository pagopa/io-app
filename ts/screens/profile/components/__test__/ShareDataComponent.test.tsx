import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { openWebUrl } from "../../../../utils/url";
import { ShareDataComponent } from "../ShareDataComponent";

const mockPresentFn = jest.fn();
jest.mock("../../../../utils/bottomSheet", () => ({
  __esModule: true,
  useIOBottomSheet: () => ({ present: mockPresentFn })
}));
jest.mock("../../../../utils/url");

describe("Test ShareDataComponent", () => {
  it("should be not null", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should call useIOBottomSheet present function on press why Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByTestId("why");
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(mockPresentFn).toHaveBeenCalled();
  });
  it("should call useIOBottomSheet present function on press security Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByTestId("security");
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(mockPresentFn).toHaveBeenCalled();
  });
  it("should call openWebUrl on press gdpr Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByTestId("gdpr");
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(openWebUrl).toHaveBeenCalled();
  });
  it("should call openWebUrl on press additionalInformation Body", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByTestId("additionalInformation");
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(openWebUrl).toHaveBeenCalled();
  });
});

const renderComponent = () => render(<ShareDataComponent />);
