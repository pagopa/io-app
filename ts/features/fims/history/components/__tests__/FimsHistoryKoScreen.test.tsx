import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FIMS_ROUTES } from "../../../common/navigation";
import { FimsHistoryKoScreen } from "../FimsHistoryKoScreen";
import * as NAVIGATION from "../../../../../navigation/params/AppParamsList";
import * as DISPATCH from "../../../../../store/hooks";
import { fimsHistoryGet } from "../../store/actions";

describe("fimshistoryKoScreen", () => {
  it("should match snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should go back on back press", () => {
    const mockBack = jest.fn();
    jest.spyOn(NAVIGATION, "useIONavigation").mockImplementation(
      () =>
        ({
          goBack: mockBack
        } as any)
    );
    const component = renderComponent();
    expect(component).toBeDefined();

    const button = component.getByTestId("test-back");
    expect(button).toBeDefined();

    fireEvent.press(button);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
  it("should dispatch the correct retry action on retry press", () => {
    const mockDispatch = jest.fn();
    jest
      .spyOn(DISPATCH, "useIODispatch")
      .mockImplementation(() => mockDispatch);

    const component = renderComponent();
    expect(component).toBeDefined();

    const button = component.getByTestId("test-retry");
    expect(button).toBeDefined();

    fireEvent.press(button);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      fimsHistoryGet.request({ shouldReloadFromScratch: true })
    );
  });
});
const renderComponent = () =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    FimsHistoryKoScreen,
    FIMS_ROUTES.HISTORY,
    {},
    createStore(appReducer, applicationChangeState("active") as any)
  );
