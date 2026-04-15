import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { DifferentCFErrorScreen } from "../screens/DifferentCFErrorScreen";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";

const mockNavigate = jest.fn();

jest.mock("../../../../navigation/params/AppParamsList", () => {
  const actual = jest.requireActual(
    "../../../../navigation/params/AppParamsList"
  );
  return {
    ...actual,
    useIONavigation: () => ({
      navigate: mockNavigate
    })
  };
});

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("DifferentCFErrorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly and match snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render correctly UI", () => {
    const { getByText, getByTestId } = renderComponent();

    expect(getByTestId("different-cf-error")).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.auth_errors.not_same_cf.title"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.auth_errors.not_same_cf.subtitle"))
    ).toBeTruthy();
    expect(
      getByText(I18n.t("authentication.auth_errors.not_same_cf.button"))
    ).toBeTruthy();
  });

  it("should dispatch actions and navigate to LANDING screen when pressing close", () => {
    const { getByText } = renderComponent();
    fireEvent.press(
      getByText(I18n.t("authentication.auth_errors.not_same_cf.button"))
    );

    expect(mockDispatch).toHaveBeenCalled();
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <DifferentCFErrorScreen />,
    "DUMMY",
    {},
    store
  );
}
