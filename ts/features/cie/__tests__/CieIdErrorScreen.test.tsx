import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CieIdErrorScreen from "../screens/errors/CieIdErrorScreen";
import * as useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import ROUTES from "../../../navigation/routes";

const mockReplace = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace,
      navigate: mockNavigate
    })
  };
});
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn
}));

describe("CieIdErrorScreen where device supports NFC", () => {
  afterEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.spyOn(useNavigateToLoginMethod, "default").mockImplementation(() => ({
      ...jest.requireActual("../../../hooks/useNavigateToLoginMethod"),
      isCieSupported: true
    }));
  });

  it("Should be defined", testIsDefined);
  it("Should match the snapshot", testMatchSnapshot);
  it("Should navigate to CIE + PIN screen", () => {
    const { getByTestId } = render(<CieIdErrorScreen />);
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
  it("Should properly call replace", testReplace);
});
describe("CieIdErrorScreen where device doesn't support NFC", () => {
  afterEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.spyOn(useNavigateToLoginMethod, "default").mockImplementation(() => ({
      ...jest.requireActual("../../../hooks/useNavigateToLoginMethod"),
      isCieSupported: false
    }));
  });

  it("Should be defined", testIsDefined);
  it("Should match the snapshot", testMatchSnapshot);
  it("Should navigate to Idp Selection screen", () => {
    const { getByTestId } = render(<CieIdErrorScreen />);
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_SELECTION
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
  it("Should properly call pop-to-top", testReplace);
});

function testIsDefined() {
  const component = render(<CieIdErrorScreen />);

  expect(component).toBeDefined();
}

function testMatchSnapshot() {
  const component = render(<CieIdErrorScreen />);

  expect(component).toMatchSnapshot();
}

function testReplace() {
  const { getByTestId } = render(<CieIdErrorScreen />);
  const primaryAction = getByTestId("cie-id-error-secondary-action");

  fireEvent.press(primaryAction);

  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalled();
}
