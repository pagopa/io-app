import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CieIdErrorScreen from "../screens/errors/CieIdErrorScreen";
import * as useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";

const mockNavigateToCiePinInsertion = jest.fn();
const mockNavigateToIdpSelection = jest.fn();
const mockNavigateToCieIdScreen = jest.fn();
const mockPopToTop = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      popToTop: mockPopToTop
    })
  };
});

describe("CieIdErrorScreen where device supports NFC", () => {
  afterEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.spyOn(useNavigateToLoginMethod, "default").mockImplementation(() => ({
      navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
      navigateToIdpSelection: mockNavigateToIdpSelection,
      navigateToCieIdLoginScreen: mockNavigateToCieIdScreen,
      isCieSupported: true
    }));
  });

  it("Should be defined", testIsDefined);
  it("Should match the snapshot", testMatchSnapshot);
  it("Should navigate to CIE + PIN screen", () => {
    const { getByTestId } = render(<CieIdErrorScreen />);
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockNavigateToCiePinInsertion).toHaveBeenCalled();
    expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdScreen).not.toHaveBeenCalled();
    expect(mockPopToTop).not.toHaveBeenCalled();
  });
  it("Should properly call pop-to-top", testPopToTop);
});
describe("CieIdErrorScreen where device doesn't support NFC", () => {
  afterEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.spyOn(useNavigateToLoginMethod, "default").mockImplementation(() => ({
      navigateToCiePinInsertion: mockNavigateToCiePinInsertion,
      navigateToIdpSelection: mockNavigateToIdpSelection,
      navigateToCieIdLoginScreen: mockNavigateToCieIdScreen,
      isCieSupported: false
    }));
  });

  it("Should be defined", testIsDefined);
  it("Should match the snapshot", testMatchSnapshot);
  it("Should navigate to Idp Selection screen", () => {
    const { getByTestId } = render(<CieIdErrorScreen />);
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockNavigateToIdpSelection).toHaveBeenCalled();
    expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
    expect(mockNavigateToCieIdScreen).not.toHaveBeenCalled();
    expect(mockPopToTop).not.toHaveBeenCalled();
  });
  it("Should properly call pop-to-top", testPopToTop);
});

function testIsDefined() {
  const component = render(<CieIdErrorScreen />);

  expect(component).toBeDefined();
}

function testMatchSnapshot() {
  const component = render(<CieIdErrorScreen />);

  expect(component).toMatchSnapshot();
}

function testPopToTop() {
  const { getByTestId } = render(<CieIdErrorScreen />);
  const primaryAction = getByTestId("cie-id-error-secondary-action");

  fireEvent.press(primaryAction);

  expect(mockNavigateToCiePinInsertion).not.toHaveBeenCalled();
  expect(mockNavigateToIdpSelection).not.toHaveBeenCalled();
  expect(mockNavigateToCieIdScreen).not.toHaveBeenCalled();
  expect(mockPopToTop).toHaveBeenCalled();
}
