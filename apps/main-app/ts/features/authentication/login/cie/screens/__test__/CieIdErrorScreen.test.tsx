import { fireEvent, render } from "@testing-library/react-native";
import { ComponentProps } from "react";

import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as useNavigateToLoginMethod from "../../../hooks/useNavigateToLoginMethod";
import CieIdErrorScreen, { CieIdErrorScreenParams } from "../CieIdErrorScreen";

type CieIdErrorScreenProps = ComponentProps<typeof CieIdErrorScreen>;

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

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));
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

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
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
    const { getByTestId } = renderScreen();
    const primaryAction = getByTestId("cie-id-error-primary-action");

    fireEvent.press(primaryAction);

    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.IDP_SELECTION
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
  it("Should properly call pop-to-top", testReplace);
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
      name: "the failure when provided by the OneIdentity flow",
      params: {
        failure: {
          type: "ONE_IDENTITY_LOGIN_FAILURE",
          payload: { reason: "some reason" }
        }
      },
      expected: {
        failure: {
          type: "ONE_IDENTITY_LOGIN_FAILURE",
          payload: { reason: "some reason" }
        },
        flow: "auth",
        isCieSupported: true
      }
    },
    {
      name: "no failure when reached from the legacy flow",
      params: undefined,
      expected: { flow: "auth", isCieSupported: true }
    }
  ])("Should set $name as debug data", ({ params, expected }) => {
    renderScreen(params as CieIdErrorScreenParams | undefined);

    expect(mockUseDebugInfo).toHaveBeenLastCalledWith(expected);
  });
});

function renderScreen(params?: CieIdErrorScreenParams) {
  const route: CieIdErrorScreenProps["route"] = {
    key: AUTHENTICATION_ROUTES.CIE_ID_ERROR,
    name: AUTHENTICATION_ROUTES.CIE_ID_ERROR,
    params
  };
  return render(
    <CieIdErrorScreen
      // The screen reads navigation from useIONavigation, which is mocked above
      navigation={{} as CieIdErrorScreenProps["navigation"]}
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

function testReplace() {
  const { getByTestId } = renderScreen();
  const primaryAction = getByTestId("cie-id-error-secondary-action");

  fireEvent.press(primaryAction);

  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalled();
}
