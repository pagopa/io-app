import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { OtpCode } from "../../../../../../../definitions/cgn/OtpCode";
import { remoteReady } from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CgnDiscountCodeScreen from "../CgnDiscountCodeScreen";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    CgnDiscountCodeScreen,
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
});
