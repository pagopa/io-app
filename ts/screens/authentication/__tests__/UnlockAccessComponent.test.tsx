import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import { createStore } from "redux";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "../../authentication/UnlockAccessComponent";
import { useIOBottomSheetAutoresizableModal } from "../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../utils/url";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";

jest.mock("../../../utils/hooks/bottomSheet");
jest.mock("../../../utils/url");
jest.mock("../../../navigation/params/AppParamsList");

const mockedUseIOBottomSheetAutoresizableModal =
  useIOBottomSheetAutoresizableModal as jest.Mock;
const mockedOpenWebUrl = openWebUrl as jest.Mock;
const mockedUseIONavigation = useIONavigation as jest.Mock;

describe("UnlockAccessComponent", () => {
  const mockNavigation = {
    navigate: jest.fn()
  };

  beforeEach(() => {
    mockedUseIONavigation.mockReturnValue(mockNavigation);
    mockedUseIOBottomSheetAutoresizableModal.mockReturnValue({
      present: jest.fn(),
      bottomSheet: null
    });
    jest.clearAllMocks();
  });

  it("renders correctly with authLevel L2", () => {
    const { getByText, getAllByText } = renderComponent("L2");

    expect(getAllByText(I18n.t("authentication.unlock.title"))).toHaveLength(2);
    expect(getByText(I18n.t("authentication.unlock.subtitlel2"))).toBeTruthy();
  });

  it("renders correctly with authLevel L3", () => {
    const { getByText, getAllByText } = renderComponent("L3");

    expect(getAllByText(I18n.t("authentication.unlock.title"))).toHaveLength(2);
    expect(getByText(I18n.t("authentication.unlock.subtitlel3"))).toBeTruthy();
  });

  it("calls openWebUrl when primary button is pressed", () => {
    const { getByTestId } = renderComponent("L2");
    const button = getByTestId("button-solid-test");

    fireEvent.press(button);

    expect(mockedOpenWebUrl).toHaveBeenCalledWith("https://ioapp.it/");
  });

  it("calls navigation.navigate when action button is pressed with authLevel L2", () => {
    const { getByTestId } = renderComponent("L2");
    const button = getByTestId("button-link-test");

    fireEvent.press(button);

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      ROUTES.AUTHENTICATION,
      {
        screen: ROUTES.AUTHENTICATION_LANDING
      }
    );
  });

  it("calls present modal when learn more link is pressed", () => {
    const presentMock = jest.fn();
    const bottomSheetMock = <View testID="modal-view-test" />;
    mockedUseIOBottomSheetAutoresizableModal.mockReturnValueOnce({
      present: presentMock,
      bottomSheet: bottomSheetMock
    });

    const { getByTestId } = renderComponent("L2");
    const link = getByTestId("learn-more-link-test");

    fireEvent.press(link);

    expect(presentMock).toHaveBeenCalled();
  });
});

const renderComponent = (authLevel?: "L2" | "L3") => {
  if (authLevel) {
    const props: UnlockAccessProps = { authLevel };
    return render(<UnlockAccessComponent {...props} />);
  } else {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    return renderScreenWithNavigationStoreContext(
      UnlockAccessComponent,
      "DUMMY",
      {},
      store
    );
  }
};
