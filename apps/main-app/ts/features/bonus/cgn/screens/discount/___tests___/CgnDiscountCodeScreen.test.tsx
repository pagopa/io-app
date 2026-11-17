import { OtpCode } from "@io-app/api-types/generated/definitions/cgn/OtpCode";
import { IOColors } from "@io-app/design-system";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { remoteReady } from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  findAllByStyle,
  withDarkTheme
} from "../../../../../../utils/testColors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CgnDiscountCodeScreen from "../CgnDiscountCodeScreen";

const renderComponent = (
  state: GlobalState,
  theme: "dark" | "light" = "light"
) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    theme === "dark"
      ? withDarkTheme(CgnDiscountCodeScreen)
      : CgnDiscountCodeScreen,
    CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE,
    {},
    store
  );
};

const mockNavigate = jest.fn();
const mockPop = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    addListener: jest.fn(),
    navigate: mockNavigate,
    pop: mockPop,
    setOptions: mockSetOptions
  })
}));

const globalState = appReducer(undefined, applicationChangeState("active"));

const defaultState: GlobalState = {
  ...globalState,
  bonus: {
    ...globalState.bonus,
    cgn: {
      ...globalState.bonus.cgn,
      otp: {
        ...globalState.bonus.cgn.otp,
        data: remoteReady({
          code: "123456" as OtpCode,
          expires_at: new Date(),
          ttl: 100
        })
      }
    }
  }
};

describe("CgnDiscountCodeScreen", () => {
  it("should render correctly", () => {
    const component = renderComponent(defaultState);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should navigate back", () => {
    const component = renderComponent(defaultState);

    const back = component.getByTestId("close-button");
    fireEvent.press(back);

    expect(mockPop).toHaveBeenCalled();
  });

  it("should generate new discount code", () => {
    const state = {
      ...defaultState,
      bonus: {
        ...defaultState.bonus,
        cgn: {
          ...defaultState.bonus.cgn,
          otp: {
            ...defaultState.bonus.cgn.otp,
            data: remoteReady({
              code: "123456" as OtpCode,
              expires_at: new Date(),
              ttl: 0
            })
          }
        }
      }
    };
    const component = renderComponent(state);

    const generateButton = component.getByTestId("generate-button");
    fireEvent.press(generateButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should draw the code box border with the dark stroke token in dark mode", () => {
    const state: GlobalState = {
      ...defaultState,
      bonus: {
        ...defaultState.bonus,
        cgn: {
          ...defaultState.bonus.cgn,
          merchants: {
            ...defaultState.bonus.cgn.merchants,
            selectedDiscountCode: "ABC123"
          },
          otp: {
            ...defaultState.bonus.cgn.otp,
            data: remoteReady({
              code: "123456" as OtpCode,
              expires_at: new Date(Date.now() + 60_000),
              ttl: 60
            })
          }
        }
      }
    };
    const { toJSON } = renderComponent(state, "dark");

    expect(
      findAllByStyle(toJSON(), {
        borderColor: IOColors.dark.stroke.default,
        borderWidth: 1
      })
    ).toHaveLength(1);
  });
});
