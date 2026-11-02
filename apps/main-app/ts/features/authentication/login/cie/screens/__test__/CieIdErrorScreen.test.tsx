import { fireEvent, render } from "@testing-library/react-native";

import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import CieIdErrorScreen, { CieIdErrorScreenParams } from "../CieIdErrorScreen";

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));

const mockPopTo = jest.fn();
const mockPopToTop = jest.fn();

// const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn
}));

jest.mock("../../../../../../store/hooks", () => {
  const actualNav = jest.requireActual("../../../../../../store/hooks");
  return {
    ...actualNav,
    useIOSelector: jest.fn()
  };
});

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
    const { getByTestId } = renderScreen();
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    // expect(mockDispatch).toHaveBeenCalled();

    expect(mockPopTo).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    );
  });
  it("Should pop to LANDING on secondary action", testPopToLanding);
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
    const { getByTestId } = renderScreen();
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockPopTo).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.IDP_SELECTION);
  });
  it("Should pop to LANDING on secondary action", testPopToLanding);
});

describe("CieIdErrorScreen debug info", () => {
  afterEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.spyOn(useNavigateToLoginMethod, "default").mockImplementation(() => ({
      ...jest.requireActual("../../../hooks/useNavigateToLoginMethod"),
      isCieSupported: true
    }));
  });

  it.each([
    {
      name: "the received failure data",
      params: { failureData: { reason: "some reason", code: 500 } },
      expected: {
        reason: "some reason",
        code: 500,
        flow: "auth",
        isCieSupported: true
      }
    },
    {
      name: "only the flow when reached from the legacy flow",
      params: undefined,
      expected: { flow: "auth", isCieSupported: true }
    }
  ])("Should set $name as debug data", ({ params, expected }) => {
    renderScreen(params);

    expect(mockUseDebugInfo).toHaveBeenLastCalledWith(expected);
  });
});

function renderScreen(params?: CieIdErrorScreenParams) {
  type Props = Parameters<typeof CieIdErrorScreen>[0];
  const route: Props["route"] = {
    key: AUTHENTICATION_ROUTES.CIE_ID_ERROR,
    name: AUTHENTICATION_ROUTES.CIE_ID_ERROR,
    params
  };
  return render(
    <CieIdErrorScreen
      navigation={
        {
          popTo: mockPopTo,
          popToTop: mockPopToTop
        } as unknown as Props["navigation"]
      }
      route={route}
    />
  );
}

function testIsDefined() {
  const component = renderScreen();

  expect(component).toBeDefined();
}

function testMatchSnapshot() {
  const component = renderScreen();

  expect(component).toMatchSnapshot();
}

function testPopToLanding() {
  const { getByTestId } = renderScreen();
  const primaryAction = getByTestId("cie-id-error-secondary-action");

  fireEvent.press(primaryAction);

  expect(mockPopTo).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.LANDING);
  expect(mockPopToTop).not.toHaveBeenCalled();
}
