import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { cieLoginEnableUat, cieLoginDisableUat } from "../../store/actions";
import * as hooks from "../../../../../../store/hooks";
import CieLoginConfigScreenContent from "../CieLoginConfigScreenContent";

jest.mock("../../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));

describe("CieLoginConfigScreenContent", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("renders correctly when UAT is disabled", () => {
    (hooks.useIOSelector as jest.Mock).mockReturnValue(false);

    const { getByText } = renderComponent();

    expect(getByText(/Questa opzione serve agli sviluppatori/i)).toBeTruthy();

    expect(getByText(/Abilita endpoint di collaudo/i)).toBeTruthy();
  });

  it("dispatches enable action when checkbox is selected", () => {
    (hooks.useIOSelector as jest.Mock).mockReturnValue(false);

    const { getByText } = renderComponent();

    fireEvent(
      getByText(/Abilita endpoint di collaudo/i).parent!,
      "onValueChange",
      true
    );

    expect(mockDispatch).toHaveBeenCalledWith(cieLoginEnableUat());
  });

  it("dispatches disable action when checkbox is deselected", () => {
    (hooks.useIOSelector as jest.Mock).mockReturnValue(true);

    const { getByText } = renderComponent();

    fireEvent(
      getByText(/Abilita endpoint di collaudo/i).parent!,
      "onValueChange",
      false
    );

    expect(mockDispatch).toHaveBeenCalledWith(cieLoginDisableUat());
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieLoginConfigScreenContent />,
    "DUMMY",
    {},
    store
  );
}
