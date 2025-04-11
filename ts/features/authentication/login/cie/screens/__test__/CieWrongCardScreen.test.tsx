import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CieWrongCardScreen from "../../screens/CieWrongCardScreen";
import I18n from "../../../../../../i18n";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";

const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset
  })
}));

describe("CieWrongCardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly and matches snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("calls navigate to CiePinScreen on retry", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    expect(mockNavigate).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    });
  });

  it("calls reset to Landing on close", () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText(I18n.t("global.buttons.close")));
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
    });
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieWrongCardScreen />,
    AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN,
    {},
    store
  );
}
