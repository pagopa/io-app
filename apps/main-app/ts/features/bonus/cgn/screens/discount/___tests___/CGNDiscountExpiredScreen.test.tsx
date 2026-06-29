import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CGNDiscountExpiredScreen from "../CGNDiscountExpiredScreen";

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    CGNDiscountExpiredScreen,
    CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT_CODE_FAILURE,
    {},
    store
  );
};

const mockNavigate = jest.fn();
const mockPop = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate,
    pop: mockPop
  })
}));

describe("CGNDiscountExpiredScreen", () => {
  it("should render correctly", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should navigate back", () => {
    const component = renderComponent();

    const back = component.getByTestId("close-button");
    fireEvent.press(back);

    expect(mockPop).toHaveBeenCalled();
  });
});
